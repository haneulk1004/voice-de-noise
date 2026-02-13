import { measureLoudness, calculateGainNeeded } from './analysis.js';
import { applyGainAndLimit } from './limiter.js';

/**
 * Process audio file for loudness normalization only (no noise reduction)
 * @param {File} file - Audio file to process
 * @param {Function} onProgress - Progress callback (0-100)
 * @param {number} targetLufs - Target LUFS level
 * @returns {Promise<AudioBuffer>} - Processed audio buffer
 */
export async function processLoudness(file, onProgress, targetLufs = -16) {
    // 1. Decode File
    if (onProgress) onProgress(5);
    const arrayBuffer = await file.arrayBuffer();
    const tempCtx = new AudioContext();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    tempCtx.close();

    if (onProgress) onProgress(20);

    // 2. Measure Current Loudness
    const currentLufs = measureLoudness(audioBuffer);
    const gainNeeded = calculateGainNeeded(currentLufs, targetLufs);
    console.log(`Current: ${currentLufs.toFixed(2)} LUFS, Target: ${targetLufs}, Gain: ${gainNeeded.toFixed(2)}dB`);

    if (onProgress) onProgress(40);

    // 3. Apply Gain and Limiter
    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtxClass(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const { output } = applyGainAndLimit(offlineCtx, source, gainNeeded);
    output.connect(offlineCtx.destination);

    source.start();

    if (onProgress) onProgress(60);

    // Progress simulation during rendering
    const startTime = Date.now();
    const duration = audioBuffer.duration;
    const estimatedTime = duration * 500; // Fast processing

    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(95, 60 + (elapsed / estimatedTime) * 35);
        if (onProgress) onProgress(Math.floor(progress));
    }, 100);

    const finalBuffer = await offlineCtx.startRendering();
    clearInterval(progressInterval);

    if (onProgress) onProgress(100);

    return finalBuffer;
}
