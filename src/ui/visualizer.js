
export class AudioVisualizer {
    constructor(canvasId, analyserIn, analyserOut, onStats) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.analyserIn = analyserIn;
        this.analyserOut = analyserOut;
        this.onStats = onStats;
        this.isRunning = false;

        this.fftSize = 2048;
        this.analyserIn.fftSize = this.fftSize;
        this.analyserOut.fftSize = this.fftSize;

        this.bufferLength = this.analyserIn.frequencyBinCount;
        this.dataArrayIn = new Uint8Array(this.bufferLength);
        this.dataArrayOut = new Uint8Array(this.bufferLength);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.frameCount = 0;
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.draw();
    }

    stop() {
        this.isRunning = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.draw());

        this.analyserIn.getByteFrequencyData(this.dataArrayIn);
        this.analyserOut.getByteFrequencyData(this.dataArrayOut);

        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = (width / this.bufferLength) * 2.5;
        let x = 0;

        let sumIn = 0;
        let sumOut = 0;

        this.ctx.fillStyle = '#242424'; // Background
        this.ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < this.bufferLength; i++) {
            // Draw Input (Gray/Ghost)
            let barHeightIn = this.dataArrayIn[i] / 255 * height;
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            this.ctx.fillRect(x, height - barHeightIn, barWidth, barHeightIn);

            // Draw Output (Color/Main)
            let barHeightOut = this.dataArrayOut[i] / 255 * height;

            // Gradient for active signal
            const gradient = this.ctx.createLinearGradient(0, height, 0, height - barHeightOut);
            gradient.addColorStop(0, '#646cff');
            gradient.addColorStop(1, '#a1a6ff');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, height - barHeightOut, barWidth, barHeightOut);

            x += barWidth + 1;

            sumIn += this.dataArrayIn[i];
            sumOut += this.dataArrayOut[i];
        }

        this.frameCount++;
        if (this.frameCount % 10 === 0 && this.onStats) {
            const avgIn = sumIn / this.bufferLength;
            const avgOut = sumOut / this.bufferLength;
            this.onStats({ avgIn, avgOut });
        }
    }
}
