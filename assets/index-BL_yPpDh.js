var g=(n,t,s)=>new Promise((r,e)=>{var i=d=>{try{a(s.next(d))}catch(c){e(c)}},o=d=>{try{a(s.throw(d))}catch(c){e(c)}},a=d=>d.done?r(d.value):Promise.resolve(d.value).then(i,o);a((s=s.apply(n,t)).next())});(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function s(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(e){if(e.ep)return;e.ep=!0;const i=s(e);fetch(e.href,i)}})();var R="@sapphi-red/web-noise-suppressor/speex",P=class extends AudioWorkletNode{constructor(n,{maxChannels:t,wasmBinary:s}){const r={processorOptions:{maxChannels:t,wasmBinary:s}};super(n,R,r)}destroy(){this.port.postMessage("destroy")}};const N=""+new URL("workletProcessor-_AMzdT6B.js",import.meta.url).href,z=""+new URL("speex-BeXkxj2B.wasm",import.meta.url).href;class q{constructor(){this.ctx=null,this.node=null,this.eqNode=null,this.source=null,this.destination=null,this.wasmBinary=null}init(t){return g(this,null,function*(){this.ctx=t;try{if(!this.wasmBinary){const s=yield fetch(z);this.wasmBinary=yield s.arrayBuffer()}return yield this.ctx.audioWorklet.addModule(N),this.node=new P(this.ctx,{wasmBinary:this.wasmBinary,maxChannels:1}),this.eqNode=this.ctx.createBiquadFilter(),this.eqNode.type="highshelf",this.eqNode.frequency.value=5e3,this.eqNode.gain.value=0,this.node.connect(this.eqNode),console.log("NoiseSuppressor initialized"),this.node}catch(s){throw console.error("Failed to initialize NoiseSuppressor:",s),s}})}connect(t,s){if(!this.node)throw new Error("NoiseSuppressor not initialized");this.source=t,this.destination=s,t.connect(this.node),this.eqNode.connect(s)}disconnect(){this.node&&this.node.disconnect(),this.eqNode&&this.eqNode.disconnect()}setBypass(t){!this.source||!this.destination||(this.source.disconnect(),this.node.disconnect(),this.eqNode.disconnect(),t?this.source.connect(this.destination):(this.source.connect(this.node),this.node.connect(this.eqNode),this.eqNode.connect(this.destination)))}setEQ(t){this.eqNode&&this.eqNode.gain.setTargetAtTime(t,this.ctx.currentTime,.1)}setParams(t){console.log("Params updated:",t)}}class M{constructor(t,s,r,e){this.canvas=document.getElementById(t),this.ctx=this.canvas.getContext("2d"),this.analyserIn=s,this.analyserOut=r,this.onStats=e,this.isRunning=!1,this.fftSize=2048,this.analyserIn.fftSize=this.fftSize,this.analyserOut.fftSize=this.fftSize,this.bufferLength=this.analyserIn.frequencyBinCount,this.dataArrayIn=new Uint8Array(this.bufferLength),this.dataArrayOut=new Uint8Array(this.bufferLength),this.resize(),window.addEventListener("resize",()=>this.resize()),this.frameCount=0}resize(){this.canvas.width=this.canvas.clientWidth,this.canvas.height=this.canvas.clientHeight}start(){this.isRunning||(this.isRunning=!0,this.draw())}stop(){this.isRunning=!1,this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}draw(){if(!this.isRunning)return;requestAnimationFrame(()=>this.draw()),this.analyserIn.getByteFrequencyData(this.dataArrayIn),this.analyserOut.getByteFrequencyData(this.dataArrayOut);const t=this.canvas.width,s=this.canvas.height,r=t/this.bufferLength*2.5;let e=0,i=0,o=0;this.ctx.fillStyle="#242424",this.ctx.fillRect(0,0,t,s);for(let a=0;a<this.bufferLength;a++){let d=this.dataArrayIn[a]/255*s;this.ctx.fillStyle="rgba(100, 100, 100, 0.3)",this.ctx.fillRect(e,s-d,r,d);let c=this.dataArrayOut[a]/255*s;const h=this.ctx.createLinearGradient(0,s,0,s-c);h.addColorStop(0,"#646cff"),h.addColorStop(1,"#a1a6ff"),this.ctx.fillStyle=h,this.ctx.fillRect(e,s-c,r,c),e+=r+1,i+=this.dataArrayIn[a],o+=this.dataArrayOut[a]}if(this.frameCount++,this.frameCount%10===0&&this.onStats){const a=i/this.bufferLength,d=o/this.bufferLength;this.onStats({avgIn:a,avgOut:d})}}}function D(n,t){return g(this,null,function*(){const s=yield n.arrayBuffer(),e=yield new AudioContext().decodeAudioData(s),i=new OfflineAudioContext(e.numberOfChannels,e.length,e.sampleRate);yield i.audioWorklet.addModule(N);const o=i.createBufferSource();o.buffer=e;const a=new q;return yield a.init(i),o.connect(a.node),a.node.connect(i.destination),o.start(),yield i.startRendering()})}function T(n){const t=n.numberOfChannels,s=n.length*t*2+44,r=new ArrayBuffer(s),e=new DataView(r),i=[];let o,a,d=0,c=0;for(l(1179011410),l(s-8),l(1163280727),l(544501094),l(16),h(1),h(t),l(n.sampleRate),l(n.sampleRate*2*t),h(t*2),h(16),l(1635017060),l(s-c-4),o=0;o<n.numberOfChannels;o++)i.push(n.getChannelData(o));for(;c<n.length;){for(o=0;o<t;o++)a=Math.max(-1,Math.min(1,i[o][c])),a=(.5+a<0?a*32768:a*32767)|0,e.setInt16(44+d,a,!0),d+=2;c++}return new Blob([r],{type:"audio/wav"});function h(I){e.setUint16(c,I,!0),c+=2}function l(I){e.setUint32(c,I,!0),c+=4}}const k=document.querySelector("#app");k.innerHTML=`
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
`;let u,b,A,y,w,x,m;const C=document.getElementById("startBtn"),S=document.getElementById("stopBtn"),p=document.getElementById("statusText"),L=document.getElementById("snrDisplay"),O=document.getElementById("fileInput"),f=document.getElementById("processBtn"),E=document.getElementById("fileStatus"),F=document.getElementById("dropZoneText");C.addEventListener("click",()=>g(void 0,null,function*(){try{C.disabled=!0,p.textContent="Requesting Access...",u=new(window.AudioContext||window.webkitAudioContext),b=yield navigator.mediaDevices.getUserMedia({audio:!0}),p.textContent="Loading Engine...",y=new q,yield y.init(u),w=u.createAnalyser(),x=u.createAnalyser(),A=u.createMediaStreamSource(b),A.connect(w),w.connect(y.node),y.node.connect(x),x.connect(u.destination);const n=({avgIn:t,avgOut:s})=>{const e=(Math.max(0,t-s)/255*30).toFixed(1);L.innerHTML=`NR: <span class="status-value">${e} dB</span>`};m&&m.stop(),m=new M("spectrum",w,x,n),m.start(),p.textContent="Active",p.style.color="var(--success-color)",S.disabled=!1,document.getElementById("eqGain").disabled=!1}catch(n){console.error(n),p.textContent="Error",p.style.color="var(--danger-color)",C.disabled=!1}}));S.addEventListener("click",()=>{m&&m.stop(),u&&(u.close(),u=null),b&&(b.getTracks().forEach(n=>n.stop()),b=null),C.disabled=!1,S.disabled=!0,p.textContent="Ready",p.style.color="var(--text-muted)",L.innerHTML='NR: <span class="status-value">0.0 dB</span>',document.getElementById("eqGain").disabled=!0});const v=document.getElementById("bypassBtn"),U=document.getElementById("eqGain");let B=!1;v.addEventListener("click",()=>{y&&(B=!B,y.setBypass(B),B?(v.textContent="Original",v.className="active-bypass"):(v.textContent="Processed",v.className="active-processed"))});U.addEventListener("input",n=>{y&&y.setEQ(parseFloat(n.target.value))});document.getElementById("mode").addEventListener("change",n=>{});O.addEventListener("change",n=>{if(n.target.files.length>0){const t=n.target.files[0].name;F.textContent=t,f.disabled=!1,E.textContent="Ready to process"}});f.addEventListener("click",()=>g(void 0,null,function*(){const n=O.files[0];if(n)try{f.disabled=!0,f.textContent="Processing...";const t=yield D(n);f.textContent="Encoding...";const s=T(t),r=URL.createObjectURL(s),e=document.createElement("a");e.href=r,e.download=`denoised_${n.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(e),e.click(),document.body.removeChild(e),f.textContent="Process & Download WAV",f.disabled=!1,E.textContent="Download started!",setTimeout(()=>E.textContent="",3e3)}catch(t){console.error(t),E.textContent="Error processing file",f.disabled=!1}}));
