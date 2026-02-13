import './style.css';
import { NoiseSuppressor } from './src/audio/processor.js';
import { processFile } from './src/audio/fileProcessor.js';
import { exportWAV } from './src/utils/wav.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <header>
    <h1>Voice De-noise</h1>
    <div class="subtitle">AI-Powered Noise Reduction</div>
  </header>

  <div class="tabs">
    <button class="tab-btn active" data-tab="tab-main">Home</button>
    <button class="tab-btn" data-tab="tab-loudness">Loudness</button>
  </div>

  <!-- Tab: Main -->
  <div id="tab-main" class="tab-content active">
      <div class="card status-card">
        <span>Status: <span id="statusText">Ready</span></span>
      </div>

      <div class="card main-card">
        <h3>File Processing</h3>
        <div class="file-upload-area">
          <label for="fileInput" class="file-drop-zone">
            <span id="dropZoneText">Click to Select Audio File</span>
          </label>
          <input type="file" id="fileInput" accept="audio/*">
        </div>
        <div id="fileStatus"></div>

        <div class="preview-controls" id="previewContainer">
            <button id="previewBtn" class="btn-secondary">Preview Result</button>
        </div>

        <button id="processBtn" class="btn-primary" disabled>Process & Download WAV</button>
      </div>

      <div class="card">
        <h3>Audio Settings</h3>
        <div class="controls">
          <div class="control-group">
            <label for="modePreset">Processing Mode</label>
            <select id="modePreset">
                <option value="custom">Custom</option>
                <option value="dialogue" selected>Dialogue (Recommended)</option>
                <option value="gentle">Gentle</option>
                <option value="surgical">Surgical</option>
            </select>
          </div>
          <small class="hint">Dialogue: Optimized for voice | Gentle: Subtle | Surgical: Maximum removal</small>

          <div class="control-group">
            <label for="eqGain">Clarify / Treble (dB)</label>
            <input type="range" id="eqGain" min="0" max="10" value="5" step="0.5">
            <span id="eqVal">5.0</span>
          </div>

          <div class="control-group">
            <label for="nrIntensity">Denoise Amount</label>
            <input type="range" id="nrIntensity" min="0" max="100" value="85" step="1">
            <span id="nrVal">85%</span>
          </div>
        </div>
      </div>
  </div>

  <!-- Tab: Loudness -->
  <div id="tab-loudness" class="tab-content">
      <div class="card">
        <h3>Loudness Normalization</h3>
        <div class="controls">
          <div class="control-group">
            <label for="targetLufs">Loudness Target</label>
            <select id="targetLufs">
                <option value="-24">Broadcast (-24 LUFS)</option>
                <option value="-16" selected>Mobile / Podcast (-16 LUFS)</option>
                <option value="-14">Online / Streaming (-14 LUFS)</option>
            </select>
          </div>
          <small class="hint">Automatically adjusts audio loudness to match industry standards</small>
        </div>
      </div>
  </div>
`;

// Tab Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Add active to clicked
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Elements
const statusText = document.getElementById('statusText');
const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const fileStatus = document.getElementById('fileStatus');
const dropZoneText = document.getElementById('dropZoneText');
const previewBtn = document.getElementById('previewBtn');
const previewContainer = document.getElementById('previewContainer');
const eqGainInput = document.getElementById('eqGain');
const eqValDisplay = document.getElementById('eqVal');

// State
let originalFile = null;
let processedBuffer = null;
let previewCtx = null;
let previewSource = null;
let isPlaying = false;

// UI Helpers
const setStatus = (msg, type = 'normal') => {
  statusText.textContent = msg;
  statusText.className = type; // you can add css classes for colors
  if (type === 'error') statusText.style.color = 'var(--danger-color)';
  else if (type === 'success') statusText.style.color = 'var(--success-color)';
  else statusText.style.color = 'var(--text-muted)';
};

const nrIntensityInput = document.getElementById('nrIntensity');
const nrValDisplay = document.getElementById('nrVal');
const targetLufsInput = document.getElementById('targetLufs');
const modePresetInput = document.getElementById('modePreset');

// Mode Presets
const presets = {
  dialogue: {
    eqGain: 5,
    nrIntensity: 85,
    description: 'Optimized for voice clarity with natural sound'
  },
  gentle: {
    eqGain: 2,
    nrIntensity: 50,
    description: 'Subtle noise reduction, preserves most original audio'
  },
  surgical: {
    eqGain: 8,
    nrIntensity: 100,
    description: 'Maximum noise removal, may affect voice quality'
  }
};

// Apply preset
function applyPreset(presetName) {
  if (presets[presetName]) {
    const preset = presets[presetName];
    eqGainInput.value = preset.eqGain;
    eqValDisplay.textContent = preset.eqGain.toFixed(1);
    nrIntensityInput.value = preset.nrIntensity;
    nrValDisplay.textContent = preset.nrIntensity + '%';
  }
}

modePresetInput.addEventListener('change', (e) => {
  const mode = e.target.value;
  if (mode !== 'custom') {
    applyPreset(mode);
  }
});

eqGainInput.addEventListener('input', (e) => {
  eqValDisplay.textContent = parseFloat(e.target.value).toFixed(1);
  // Switch to custom if user manually adjusts
  if (modePresetInput.value !== 'custom') {
    modePresetInput.value = 'custom';
  }
});

nrIntensityInput.addEventListener('input', (e) => {
  nrValDisplay.textContent = e.target.value + '%';
  // Switch to custom if user manually adjusts
  if (modePresetInput.value !== 'custom') {
    modePresetInput.value = 'custom';
  }
});

// Initialize with dialogue preset
applyPreset('dialogue');

// Drag and Drop
const dropZone = document.querySelector('.file-drop-zone');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.classList.add('drag-over');
}

function unhighlight(e) {
  dropZone.classList.remove('drag-over');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  handleFiles(files);
}

function handleFiles(files) {
  if (files.length > 0) {
    fileInput.files = files; // Sync with input
    // Trigger change handling
    const event = new Event('change');
    fileInput.dispatchEvent(event);
  }
}

// File Input
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    originalFile = e.target.files[0];
    dropZoneText.textContent = originalFile.name;
    processBtn.disabled = false;
    fileStatus.textContent = "Ready to process";

    // Reset state
    processedBuffer = null;
    stopPreview();
    previewContainer.style.display = 'none';
    processBtn.textContent = "Process & Download WAV";

    // Reset click handler to initial processing state
    processBtn.onclick = handleProcessClick;
  }
});

// Separated Process Handler
async function handleProcessClick() {
  if (!originalFile) return;

  try {
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";
    setStatus("Processing...", "normal");

    // Parse Inputs
    const eqDb = parseFloat(eqGainInput.value);
    const nrIntensity = parseInt(nrIntensityInput.value, 10) / 100.0; // 0.0 to 1.0
    const targetLufs = parseFloat(targetLufsInput.value);

    // Process
    processedBuffer = await processFile(originalFile, (progress) => {
      fileStatus.textContent = `Processing: ${progress}%`;
    }, { eqDb, nrIntensity, targetLufs });

    // Success
    setStatus("Complete", "success");
    fileStatus.textContent = "Processing complete! You can now preview or download.";

    processBtn.textContent = "Download WAV";
    processBtn.disabled = false;

    // Show Preview
    previewContainer.style.display = 'flex';

    // Switch button to Download Mode
    processBtn.onclick = downloadProcessed;

  } catch (err) {
    console.error(err);
    setStatus("Error", "error");
    fileStatus.textContent = "Error processing file: " + err.message;
    processBtn.disabled = false;
  }
}

// Initial Listener (will be replaced by logic above, but we need to bind it initially)
processBtn.addEventListener('click', handleProcessClick);

/* 
   We remove the old huge event listener block and replace with the named function 
   to handle state changes better (Process -> Download).
*/

function downloadProcessed() {
  if (!processedBuffer) return;
  try {
    const wavBlob = exportWAV(processedBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `denoised_${originalFile.name.replace(/\.[^/.]+$/, "")}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    fileStatus.textContent = "Download started!";
  } catch (err) {
    console.error("Export Error", err);
    fileStatus.textContent = "Error exporting WAV";
  }
}

// Preview Logic
previewBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopPreview();
  } else {
    startPreview();
  }
});

function startPreview() {
  if (!processedBuffer) return;

  previewCtx = new (window.AudioContext || window.webkitAudioContext)();
  previewSource = previewCtx.createBufferSource();
  previewSource.buffer = processedBuffer;
  previewSource.connect(previewCtx.destination);

  previewSource.onended = () => {
    isPlaying = false;
    previewBtn.textContent = "Preview Result (Play)";
  };

  previewSource.start();
  isPlaying = true;
  previewBtn.textContent = "Stop Preview";
}

function stopPreview() {
  if (previewSource) {
    try { previewSource.stop(); } catch (e) { }
    previewSource = null;
  }
  if (previewCtx) {
    try { previewCtx.close(); } catch (e) { }
    previewCtx = null;
  }
  isPlaying = false;
  previewBtn.textContent = "Preview Result (Play)";
}
