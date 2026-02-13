
// Simplified Loudness Analysis (EBU R128 approximation)
// Real EBU R128 requires specific K-weighting filters (Head/High-shelf + High-pass).
// We will approximate using RMS and a weighting offset.

export function measureLoudness(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0); // Mono analysis for now
    let sum = 0;

    // Simple RMS
    for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
    }

    const rms = Math.sqrt(sum / channelData.length);

    // Avoid log(0)
    if (rms === 0) return -100;

    // Convert to dBFS
    const dbFS = 20 * Math.log10(rms);

    // K-weighting approximation offset (typically around -0.6 to -1 dB difference for speech)
    // For true compliance we need filters, but this gets us close for relative levels.
    // Let's assume standard speech spectrum.
    const approximateLUFS = dbFS - 0.691;

    return approximateLUFS;
}

export function calculateGainNeeded(currentLUFS, targetLUFS) {
    // Avoid extreme gains
    let gainDb = targetLUFS - currentLUFS;

    // Safety clamp (+/- 20dB)
    if (gainDb > 20) gainDb = 20;
    if (gainDb < -20) gainDb = -20;

    return gainDb;
}
