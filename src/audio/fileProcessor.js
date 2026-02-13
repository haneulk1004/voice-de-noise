
import { NoiseSuppressor } from '../audio/processor.js';
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url';
import { measureLoudness, calculateGainNeeded } from './analysis.js';
import { applyGainAndLimit } from './limiter.js';

export async function processFile(file, onProgress, options = {}) {
    // Parsing Options
    let eqDb = 5;
    let nrIntensity = 1.0;
    let targetLufs = -24;

    if (typeof options === 'number') {
        eqDb = options;
    } else if (typeof options === 'object') {
        if (options.eqDb !== undefined) eqDb = options.eqDb;
        if (options.nrIntensity !== undefined) nrIntensity = options.nrIntensity;
        if (options.targetLufs !== undefined) targetLufs = options.targetLufs;
    }

    // 1. Decode File
    const arrayBuffer = await file.arrayBuffer();
    const tempCtx = new AudioContext();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

    // 2. Prepare Offline Context (First Pass: Denoise)
    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtxClass(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    // Verify AudioWorklet Support - FALLBACK IF MISSING
    if (!offlineCtx.audioWorklet) {
        console.warn("OfflineAudioContext missing audioWorklet. Switching to Real-time Fallback.");
        return processFileRealtime(audioBuffer, nrIntensity, eqDb, targetLufs, onProgress);
    }

    try {
        await offlineCtx.audioWorklet.addModule(speexWorkletPath);
    } catch (e) {
        console.warn("Failed to add worklet to OfflineCtx. Switching to Real-time Fallback.", e);
        return processFileRealtime(audioBuffer, nrIntensity, eqDb, targetLufs, onProgress);
    }

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const suppressor = new NoiseSuppressor();
    await suppressor.init(offlineCtx);

    // Apply Denoise with Intensity and EQ
    suppressor.connect(source, offlineCtx.destination);
    suppressor.setIntensity(nrIntensity);
    suppressor.setEQ(eqDb);

    source.start();

    // Render Denoised Buffer
    if (onProgress) onProgress(20);
    const denoisedBuffer = await offlineCtx.startRendering();
    if (onProgress) onProgress(50);

    // Proceed to Normalization
    return normalizeAndLimit(denoisedBuffer, targetLufs, onProgress, 50, 100);
}

// Helper for Step 3 (Normalization) - Shared by both paths
async function normalizeAndLimit(denoisedBuffer, targetLufs, onProgress, startProgress, endProgress) {

    // 3a. Measure
    const currentLufs = measureLoudness(denoisedBuffer);
    const gainNeeded = calculateGainNeeded(currentLufs, targetLufs);
    console.log(`Loudness: ${currentLufs.toFixed(2)} LUFS, Target: ${targetLufs}, Gain: ${gainNeeded.toFixed(2)}dB`);

    // 3b. Render Final (Gain + Limiter)
    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const finalCtx = new OfflineCtxClass(
        denoisedBuffer.numberOfChannels,
        denoisedBuffer.length,
        denoisedBuffer.sampleRate
    );

    const denoiseSource = finalCtx.createBufferSource();
    denoiseSource.buffer = denoisedBuffer;

    // Apply Gain and Limit
    const { output } = applyGainAndLimit(finalCtx, denoiseSource, gainNeeded);
    output.connect(finalCtx.destination);

    denoiseSource.start();

    const resultPromise = finalCtx.startRendering();

    // Simulate progress
    if (onProgress) onProgress(startProgress + (endProgress - startProgress) * 0.5);

    const finalBuffer = await resultPromise;
    if (onProgress) onProgress(endProgress);

    return finalBuffer;
}

// Fallback: Real-time Processing (1x Speed) using AudioContext
async function processFileRealtime(audioBuffer, nrIntensity, eqDb, targetLufs, onProgress) {
    console.log("Starting Real-time Fallback Processing...");

    const ctx = new AudioContext();
    let denoiseSupported = true;

    try {
        await ctx.audioWorklet.addModule(speexWorkletPath);
    } catch (e) {
        console.warn("AudioWorklet not supported even in Real-time. Skipping Denoise step.", e);
        denoiseSupported = false; // FALLBACK: SKIP DENOISE
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const dest = ctx.createMediaStreamDestination();

    // Connect Graph
    if (denoiseSupported) {
        const suppressor = new NoiseSuppressor();
        await suppressor.init(ctx);
        suppressor.connect(source, dest);
        suppressor.setIntensity(nrIntensity);
        suppressor.setEQ(eqDb);
    } else {
        // Fallback: Just EQ (High Shelf approximation for "Clarify")
        const eqNode = ctx.createBiquadFilter();
        eqNode.type = 'highshelf';
        eqNode.frequency.value = 3000;
        eqNode.gain.value = eqDb;

        source.connect(eqNode);
        eqNode.connect(dest);
    }

    // Record the stream
    const mediaRecorder = new MediaRecorder(dest.stream);
    const chunks = [];

    return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            source.disconnect();
            ctx.close();

            // Convert Blob to ArrayBuffer -> AudioBuffer
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const arrayBuf = await blob.arrayBuffer();

            const decodeCtx = new AudioContext();
            try {
                const decodedCapture = await decodeCtx.decodeAudioData(arrayBuf);

                if (onProgress) onProgress(50);
                // Proceed to Normalization
                const final = await normalizeAndLimit(decodedCapture, targetLufs, onProgress, 50, 100);
                resolve(final);
            } catch (err) {
                reject(err);
            } finally {
                decodeCtx.close();
            }
        };

        // Start
        mediaRecorder.start();
        source.start();

        // Progress Loop
        const duration = audioBuffer.duration;
        const interval = setInterval(() => {
            if (ctx.state === 'closed') { clearInterval(interval); return; }
            const p = (ctx.currentTime / duration) * 50;
            if (onProgress) onProgress(Math.min(49, p));
        }, 500);

        // Stop when source ends
        source.onended = () => {
            clearInterval(interval);
            setTimeout(() => {
                mediaRecorder.stop();
            }, 100);
        };
    });
}
