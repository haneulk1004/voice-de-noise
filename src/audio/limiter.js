
// True Peak Limiter Implementation
// Using DynamicsCompressor for safety and to prevent clipping
export function createLimiter(ctx) {
    const limiter = ctx.createDynamicsCompressor();

    // Limiter settings optimized for loudness normalization
    limiter.threshold.value = -0.5; // Limit at -0.5dB (safer headroom)
    limiter.knee.value = 0.0; // Hard knee for true limiting
    limiter.ratio.value = 20.0; // High ratio for brick-wall limiting
    limiter.attack.value = 0.003; // Fast attack (3ms)
    limiter.release.value = 0.05; // Fast release (50ms)

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
