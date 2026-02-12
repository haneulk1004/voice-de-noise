import './style.css';
import { NoiseSuppressor } from './src/audio/processor.js';
import { AudioVisualizer } from './src/ui/visualizer.js';
import { processFile } from './src/audio/fileProcessor.js';
import { exportWAV } from './src/utils/wav.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <header>
    <h1>Voice De-noise</h1>
    <div class="subtitle">AI-Powered Noise Reduction</div>
  </header>

  <div class="visualizer-container">
    <canvas id="spectrum"></canvas>
  </div>

  <div class="card">
    <div class="btn-group">
      <button id="startBtn" type="button">Start Microphone</button>
      <button id="stopBtn" type="button" disabled>Stop</button>
    </div>
    
    <div class="status-bar">
      <span>Status: <span id="statusText">Ready</span></span>
      <span id="snrDisplay">NR: <span class="status-value">0.0 dB</span></span>
    </div>
  </div>

  <div class="card">
    <h3>Controls</h3>
    <div class="controls">
      <div class="control-group">
        <label for="mode">Mode</label>
        <select id="mode">
          <option value="dialogue">Dialogue</option>
          <option value="gentle">Gentle</option>
          <option value="surgical">Surgical</option>
        </select>
      </div>

      <div class="control-group">
        <label>Effect</label>
        <button id="bypassBtn" class="active-processed">Processed</button>
      </div>

      <div class="control-group">
        <label for="eqGain">Clarify (Treble)</label>
        <input type="range" id="eqGain" min="-10" max="10" value="0" step="0.5" disabled>
      </div>
      
      <!-- Hidden for MVP but kept in DOM to avoid errors if referenced -->
      <div style="display:none">
          <input type="range" id="threshold" value="-30" disabled>
          <input type="range" id="reduction" value="20" disabled>
      </div>
    </div>
  </div>

  <div class="card">
    <h3>File Processing</h3>
    <div class="file-upload-area">
      <label for="fileInput" class="file-drop-zone">
        <span id="dropZoneText">Click to Select Audio File</span>
      </label>
      <input type="file" id="fileInput" accept="audio/*">
    </div>
    <div id="fileStatus"></div>
    <button id="processBtn" style="width:100%; margin-top:1rem;" disabled>Process & Download WAV</button>
  </div>
`;

let audioCtx;
let mediaStream;
let sourceNode;
let suppressor;
let analyserIn;
let analyserOut;
let visualizer;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const snrDisplay = document.getElementById('snrDisplay');
const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const fileStatus = document.getElementById('fileStatus');
const dropZoneText = document.getElementById('dropZoneText');

// --- Mic Logic ---

startBtn.addEventListener('click', async () => {
  try {
    startBtn.disabled = true;
    statusText.textContent = "Requesting Access...";

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    statusText.textContent = "Loading Engine...";
    suppressor = new NoiseSuppressor();
    await suppressor.init(audioCtx);

    analyserIn = audioCtx.createAnalyser();
    analyserOut = audioCtx.createAnalyser();

    sourceNode = audioCtx.createMediaStreamSource(mediaStream);
    sourceNode.connect(analyserIn);
    analyserIn.connect(suppressor.node);
    suppressor.node.connect(analyserOut);
    analyserOut.connect(audioCtx.destination);

    // Visualizer & Stats
    const updateStats = ({ avgIn, avgOut }) => {
      const diff = Math.max(0, avgIn - avgOut);
      const reductionDB = (diff / 255 * 30).toFixed(1);
      snrDisplay.innerHTML = `NR: <span class="status-value">${reductionDB} dB</span>`;
    };

    if (visualizer) visualizer.stop();
    visualizer = new AudioVisualizer('spectrum', analyserIn, analyserOut, updateStats);
    visualizer.start();

    statusText.textContent = "Active";
    statusText.style.color = "var(--success-color)";
    stopBtn.disabled = false;
    document.getElementById('eqGain').disabled = false;

  } catch (err) {
    console.error(err);
    statusText.textContent = "Error";
    statusText.style.color = "var(--danger-color)";
    startBtn.disabled = false;
  }
});

stopBtn.addEventListener('click', () => {
  if (visualizer) visualizer.stop();
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }

  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusText.textContent = "Ready";
  statusText.style.color = "var(--text-muted)";
  snrDisplay.innerHTML = `NR: <span class="status-value">0.0 dB</span>`;
  document.getElementById('eqGain').disabled = true;
});

// --- Controls ---

const bypassBtn = document.getElementById('bypassBtn');
const eqGain = document.getElementById('eqGain');
let isBypassed = false;

bypassBtn.addEventListener('click', () => {
  if (!suppressor) return;
  isBypassed = !isBypassed;
  suppressor.setBypass(isBypassed);

  if (isBypassed) {
    bypassBtn.textContent = "Original";
    bypassBtn.className = "active-bypass";
  } else {
    bypassBtn.textContent = "Processed";
    bypassBtn.className = "active-processed";
  }
});

eqGain.addEventListener('input', (e) => {
  if (suppressor) suppressor.setEQ(parseFloat(e.target.value));
});

document.getElementById('mode').addEventListener('change', (e) => {
  // Mode logic placeholder
});

// --- File Upload ---

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    const fileName = e.target.files[0].name;
    dropZoneText.textContent = fileName;
    processBtn.disabled = false;
    fileStatus.textContent = "Ready to process";
  }
});

processBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";

    const renderedBuffer = await processFile(file);

    processBtn.textContent = "Encoding...";
    const wavBlob = exportWAV(renderedBuffer);
    const url = URL.createObjectURL(wavBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `denoised_${file.name.replace(/\.[^/.]+$/, "")}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    processBtn.textContent = "Process & Download WAV";
    processBtn.disabled = false;
    fileStatus.textContent = "Download started!";
    setTimeout(() => fileStatus.textContent = "", 3000);

  } catch (err) {
    console.error(err);
    fileStatus.textContent = "Error processing file";
    processBtn.disabled = false;
  }
});
