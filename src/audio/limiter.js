
// True Peak Limiter Implementation
// Using DynamicsCompressor for safety
export function createLimiter(ctx) {
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -1.0; // Limit at -1dB
    limiter.knee.value = 0.0; // Hard knee
    limiter.ratio.value = 20.0; // High ratio (limiting)
    limiter.attack.value = 0.001; // Fast attack
    limiter.release.value = 0.1; // Fast release
    return limiter;
}

// Function to apply gain and limit
export function applyGainAndLimit(ctx, source, gainDb) {
    const gainNode = ctx.createGain();
    const limiter = createLimiter(ctx);

    // Convert dB to linear
    const linearGain = Math.pow(10, gainDb / 20);
    gainNode.gain.value = linearGain;

    source.connect(gainNode);
    gainNode.connect(limiter);

    return { input: gainNode, output: limiter };
}
