
// Voice Enhancement Module
// Implements professional audio processing techniques

export class VoiceEnhancer {
    constructor() {
        this.ctx = null;
        this.highpassFilter = null;
        this.noiseGate = null;
        this.deesser = null;
        this.compressor = null;
    }

    init(ctx) {
        this.ctx = ctx;

        // 1. High-pass Filter (removes low-frequency rumble, hum)
        this.highpassFilter = ctx.createBiquadFilter();
        this.highpassFilter.type = 'highpass';
        this.highpassFilter.frequency.value = 80; // Remove frequencies below 80Hz
        this.highpassFilter.Q.value = 0.7; // Gentle slope

        // 2. Noise Gate (DynamicsCompressor used as expander)
        this.noiseGate = ctx.createDynamicsCompressor();
        this.noiseGate.threshold.value = -50; // dB - sounds below this are reduced
        this.noiseGate.knee.value = 10; // Smooth transition
        this.noiseGate.ratio.value = 12; // Strong suppression
        this.noiseGate.attack.value = 0.003; // Fast attack (3ms)
        this.noiseGate.release.value = 0.25; // Slower release (250ms) to avoid pumping

        // 3. De-esser (reduces harsh sibilance 6-8kHz)
        // We'll use a compressor triggered by high frequencies
        this.deesserFilter = ctx.createBiquadFilter();
        this.deesserFilter.type = 'peaking';
        this.deesserFilter.frequency.value = 7000; // Target sibilance range
        this.deesserFilter.Q.value = 2.0; // Narrow band
        this.deesserFilter.gain.value = -6; // Reduce by 6dB

        // 4. Multi-band Compressor (voice leveling)
        this.compressor = ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24; // Start compressing at -24dB
        this.compressor.knee.value = 12; // Soft knee for natural sound
        this.compressor.ratio.value = 4; // 4:1 ratio
        this.compressor.attack.value = 0.005; // Fast attack (5ms)
        this.compressor.release.value = 0.1; // Medium release (100ms)

        console.log('VoiceEnhancer initialized');
    }

    connect(input, output) {
        if (!this.ctx) {
            throw new Error('VoiceEnhancer not initialized');
        }

        // Signal chain:
        // Input -> High-pass -> Noise Gate -> De-esser -> Compressor -> Output
        input.connect(this.highpassFilter);
        this.highpassFilter.connect(this.noiseGate);
        this.noiseGate.connect(this.deesserFilter);
        this.deesserFilter.connect(this.compressor);
        this.compressor.connect(output);
    }

    disconnect() {
        if (this.highpassFilter) this.highpassFilter.disconnect();
        if (this.noiseGate) this.noiseGate.disconnect();
        if (this.deesserFilter) this.deesserFilter.disconnect();
        if (this.compressor) this.compressor.disconnect();
    }

    // Adjustable parameters
    setNoiseGateThreshold(dbValue) {
        // dbValue: -60 to -30 (lower = more aggressive)
        if (this.noiseGate) {
            this.noiseGate.threshold.value = dbValue;
        }
    }

    setDeesserAmount(amount) {
        // amount: 0 to 1 (0 = off, 1 = max reduction)
        if (this.deesserFilter) {
            const gain = -12 * amount; // 0 to -12dB
            this.deesserFilter.gain.value = gain;
        }
    }

    setCompressionRatio(ratio) {
        // ratio: 1 to 20 (1 = off, 20 = heavy)
        if (this.compressor) {
            this.compressor.ratio.value = ratio;
        }
    }

    setHighpassFrequency(hz) {
        // hz: 50 to 200 (higher = more aggressive)
        if (this.highpassFilter) {
            this.highpassFilter.frequency.value = hz;
        }
    }
}
