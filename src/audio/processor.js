
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
                maxChannels: 1
            });

            // EQ Node (High-shelf for clarity/air)
            this.eqNode = this.ctx.createBiquadFilter();
            this.eqNode.type = 'highshelf';
            this.eqNode.frequency.value = 5000;
            this.eqNode.gain.value = 0; // Flat by default

            // Internal connection: Suppressor -> EQ
            this.node.connect(this.eqNode);

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

        // Default path: Source -> Suppressor -> EQ -> Destination
        source.connect(this.node);
        // this.node is already connected to this.eqNode in init()
        this.eqNode.connect(destination);
    }

    disconnect() {
        if (this.node) this.node.disconnect();
        if (this.eqNode) this.eqNode.disconnect();
        // Do not disconnect source as we didn't create it
    }

    setBypass(bypass) {
        if (!this.source || !this.destination) return;

        // Disconnect everything
        this.source.disconnect();
        this.node.disconnect();
        this.eqNode.disconnect();

        if (bypass) {
            // Direct: Source -> Destination
            this.source.connect(this.destination);
        } else {
            // Processed: Source -> Suppressor -> EQ -> Destination
            this.source.connect(this.node);
            this.node.connect(this.eqNode);
            this.eqNode.connect(this.destination);
        }
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
