
import { NoiseSuppressor } from '../audio/processor.js';
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url';

export async function processFile(file, onProgress) {
    // 1. Decode File
    const arrayBuffer = await file.arrayBuffer();
    const tempCtx = new AudioContext(); // Only for decoding
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

    // 2. Prepare Offline Context
    const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    // 3. Load Module in Offline Context
    // We need to re-add the module because it's a different context
    await offlineCtx.audioWorklet.addModule(speexWorkletPath);

    // 4. Setup Graph
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const suppressor = new NoiseSuppressor();
    await suppressor.init(offlineCtx); // Using offline context

    source.connect(suppressor.node);
    suppressor.node.connect(offlineCtx.destination);
    source.start();

    // 5. Render
    // Note: Offline rendering doesn't provide granular progress in standard API easily
    // without ScriptProcessor checks, but startRendering returns a Promise.
    if (onProgress) onProgress(10); // Started

    const renderedBuffer = await offlineCtx.startRendering();
    if (onProgress) onProgress(100); // Finished

    return renderedBuffer;
}
