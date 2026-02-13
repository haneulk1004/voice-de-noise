
// Simplified Loudness Analysis (EBU R128 approximation)
// Real EBU R128 requires specific K-weighting filters (Head/High-shelf + High-pass).
// We will approximate using RMS across all channels and a weighting offset.

export function measureLoudness(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    let totalSum = 0;
    let totalSamples = 0;

    // Analyze all channels and average
    for (let ch = 0; ch < numChannels; ch++) {
        const channelData = audioBuffer.getChannelData(ch);

        for (let i = 0; i < channelData.length; i++) {
            totalSum += channelData[i] * channelData[i];
        }

        totalSamples += channelData.length;
    }

    const rms = Math.sqrt(totalSum / totalSamples);

    // Avoid log(0)
    if (rms === 0) return -100;

    // Convert to dBFS
    const dbFS = 20 * Math.log10(rms);

    // K-weighting approximation offset (adjusted for better accuracy)
    // For speech/voice content, typical offset is around -0.7 to -1.0 dB
    const approximateLUFS = dbFS - 0.7;

    return approximateLUFS;
}

export function calculateGainNeeded(currentLUFS, targetLUFS) {
    // Calculate gain difference
    let gainDb = targetLUFS - currentLUFS;

    // Safety clamp to prevent extreme adjustments
    // Positive gain: Allow up to +30dB for very quiet audio (limiter will prevent clipping)
    // Negative gain: Allow more reduction (max -20dB)
    if (gainDb > 30) {
        console.warn(`⚠️ Clamping gain from ${gainDb.toFixed(2)}dB to +30dB to prevent excessive boost`);
        gainDb = 30;
    }
    if (gainDb < -20) {
        console.warn(`⚠️ Clamping gain from ${gainDb.toFixed(2)}dB to -20dB`);
        gainDb = -20;
    }

    return gainDb;
}
