
import { SpeexWorkletNode } from '@sapphi-red/web-noise-suppressor';
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url';
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url';

export class NoiseSuppressor {
    constructor() {
        this.ctx = null;
        this.node = null;
        this.eqNode = null;
        this.source = null;
        this.destination = null;
        this.wasmBinary = null;
    }

    async init(ctx) {
        this.ctx = ctx;
        try {
            // Load WASM
            if (!this.wasmBinary) {
                const response = await fetch(speexWasmPath);
                this.wasmBinary = await response.arrayBuffer();
            }

            // Add AudioWorklet Module
            await this.ctx.audioWorklet.addModule(speexWorkletPath);

            // Create Node
            this.node = new SpeexWorkletNode(this.ctx, {
                wasmBinary: this.wasmBinary,
                maxChannels: 2  // Support stereo
            });

            // EQ Node (High-shelf for clarity/air)
            this.eqNode = this.ctx.createBiquadFilter();
            this.eqNode.type = 'highshelf';
            this.eqNode.frequency.value = 5000;
            this.eqNode.gain.value = 0; // Flat by default

            // Internal connection: Suppressor -> EQ
            this.node.connect(this.eqNode);

            // Create Wet/Dry Gain Nodes
            this.dryGain = this.ctx.createGain();
            this.wetGain = this.ctx.createGain();
            this.dryGain.gain.value = 0; // Default to full wet (processed)
            this.wetGain.gain.value = 1;

            console.log('NoiseSuppressor initialized');
            return this.node;
        } catch (err) {
            console.error('Failed to initialize NoiseSuppressor:', err);
            throw err;
        }
    }

    connect(source, destination) {
        if (!this.node) throw new Error('NoiseSuppressor not initialized');

        this.source = source;
        this.destination = destination;

        // Routing:
        // Source -> DryGain -> Destination
        // Source -> SuppressorNode -> EQ -> WetGain -> Destination

        source.connect(this.dryGain);
        this.dryGain.connect(destination);

        source.connect(this.node);
        // this.node -> this.eqNode (already connected)
        this.eqNode.connect(this.wetGain);
        this.wetGain.connect(destination);
    }

    disconnect() {
        if (this.node) {
            this.node.disconnect();
            this.eqNode.disconnect();
            this.dryGain.disconnect();
            this.wetGain.disconnect();
        }
    }

    setBypass(bypass) {
        // Bypass is essentially Intensity = 0
        this.setIntensity(bypass ? 0 : 1.0);
    }

    setIntensity(amount) {
        // amount: 0.0 (Original) to 1.0 (Fully Processed)
        // We use equal power crossfade or simple linear. 
        // For noise reduction, simple linear often feels more natural as "mixing in dry signal".
        if (!this.dryGain || !this.wetGain) return;

        const wet = Math.max(0, Math.min(1, amount));
        const dry = 1 - wet;

        this.dryGain.gain.setTargetAtTime(dry, this.ctx.currentTime, 0.1);
        this.wetGain.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.1);
    }

    setEQ(gain) {
        if (this.eqNode) {
            this.eqNode.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
        }
    }

    // Placeholder for parameter updates if supported by specific node
    setParams(params) {
        // SpeexWorkletNode might not support dynamic param updates in this wrapper version yet
        console.log("Params updated:", params);
    }
}
