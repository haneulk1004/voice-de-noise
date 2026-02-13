var w=(e,t,n)=>new Promise((o,s)=>{var i=l=>{try{r(n.next(l))}catch(u){s(u)}},a=l=>{try{r(n.throw(l))}catch(u){s(u)}},r=l=>l.done?o(l.value):Promise.resolve(l.value).then(i,a);r((n=n.apply(e,t)).next())});(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();var U="@sapphi-red/web-noise-suppressor/speex",z=class extends AudioWorkletNode{constructor(e,{maxChannels:t,wasmBinary:n}){const o={processorOptions:{maxChannels:t,wasmBinary:n}};super(e,U,o)}destroy(){this.port.postMessage("destroy")}};const F="/voice-de-noise/assets/workletProcessor-_AMzdT6B.js",$="/voice-de-noise/assets/speex-BeXkxj2B.wasm";class T{constructor(){this.ctx=null,this.node=null,this.eqNode=null,this.source=null,this.destination=null,this.wasmBinary=null}init(t){return w(this,null,function*(){this.ctx=t;try{if(!this.wasmBinary){const n=yield fetch($);this.wasmBinary=yield n.arrayBuffer()}return yield this.ctx.audioWorklet.addModule(F),this.node=new z(this.ctx,{wasmBinary:this.wasmBinary,maxChannels:1}),this.eqNode=this.ctx.createBiquadFilter(),this.eqNode.type="highshelf",this.eqNode.frequency.value=5e3,this.eqNode.gain.value=0,this.node.connect(this.eqNode),this.dryGain=this.ctx.createGain(),this.wetGain=this.ctx.createGain(),this.dryGain.gain.value=0,this.wetGain.gain.value=1,console.log("NoiseSuppressor initialized"),this.node}catch(n){throw console.error("Failed to initialize NoiseSuppressor:",n),n}})}connect(t,n){if(!this.node)throw new Error("NoiseSuppressor not initialized");this.source=t,this.destination=n,t.connect(this.dryGain),this.dryGain.connect(n),t.connect(this.node),this.eqNode.connect(this.wetGain),this.wetGain.connect(n)}disconnect(){this.node&&(this.node.disconnect(),this.eqNode.disconnect(),this.dryGain.disconnect(),this.wetGain.disconnect())}setBypass(t){this.setIntensity(t?0:1)}setIntensity(t){if(!this.dryGain||!this.wetGain)return;const n=Math.max(0,Math.min(1,t)),o=1-n;this.dryGain.gain.setTargetAtTime(o,this.ctx.currentTime,.1),this.wetGain.gain.setTargetAtTime(n,this.ctx.currentTime,.1)}setEQ(t){this.eqNode&&this.eqNode.gain.setTargetAtTime(t,this.ctx.currentTime,.1)}setParams(t){console.log("Params updated:",t)}}function j(e){const t=e.getChannelData(0);let n=0;for(let a=0;a<t.length;a++)n+=t[a]*t[a];const o=Math.sqrt(n/t.length);return o===0?-100:20*Math.log10(o)-.691}function Z(e,t){let n=t-e;return n>20&&(n=20),n<-20&&(n=-20),n}function Q(e){const t=e.createDynamicsCompressor();return t.threshold.value=-1,t.knee.value=0,t.ratio.value=20,t.attack.value=.001,t.release.value=.1,t}function H(e,t,n){const o=e.createGain(),s=Q(e),i=Math.pow(10,n/20);return o.gain.value=i,t.connect(o),o.connect(s),{input:o,output:s}}function _(o,s){return w(this,arguments,function*(e,t,n={}){let i=5,a=1,r=-24;typeof n=="number"?i=n:typeof n=="object"&&(n.eqDb!==void 0&&(i=n.eqDb),n.nrIntensity!==void 0&&(a=n.nrIntensity),n.targetLufs!==void 0&&(r=n.targetLufs));const l=yield e.arrayBuffer(),f=yield new AudioContext().decodeAudioData(l),c=window.OfflineAudioContext||window.webkitOfflineAudioContext,d=new c(f.numberOfChannels,f.length,f.sampleRate);if(!d.audioWorklet)return console.warn("OfflineAudioContext missing audioWorklet. Switching to Real-time Fallback."),N(f,a,i,r,t);try{yield d.audioWorklet.addModule(F)}catch(B){return console.warn("Failed to add worklet to OfflineCtx. Switching to Real-time Fallback.",B),N(f,a,i,r,t)}const h=d.createBufferSource();h.buffer=f;const v=new T;yield v.init(d),v.connect(h,d.destination),v.setIntensity(a),v.setEQ(i),h.start(),t&&t(20);const y=yield d.startRendering();return t&&t(50),D(y,r,t,50,100)})}function D(e,t,n,o,s){return w(this,null,function*(){const i=j(e),a=Z(i,t);console.log(`Loudness: ${i.toFixed(2)} LUFS, Target: ${t}, Gain: ${a.toFixed(2)}dB`);const r=window.OfflineAudioContext||window.webkitOfflineAudioContext,l=new r(e.numberOfChannels,e.length,e.sampleRate),u=l.createBufferSource();u.buffer=e;const{output:f}=H(l,u,a);f.connect(l.destination),u.start();const c=l.startRendering();n&&n(o+(s-o)*.5);const d=yield c;return n&&n(s),d})}function N(e,t,n,o,s){return w(this,null,function*(){console.log("Starting Real-time Fallback Processing...");const i=new AudioContext;let a=!0;try{yield i.audioWorklet.addModule(F)}catch(c){console.warn("AudioWorklet not supported even in Real-time. Skipping Denoise step.",c),a=!1}const r=i.createBufferSource();r.buffer=e;const l=i.createMediaStreamDestination();if(a){const c=new T;yield c.init(i),c.connect(r,l),c.setIntensity(t),c.setEQ(n)}else{const c=i.createBiquadFilter();c.type="highshelf",c.frequency.value=3e3,c.gain.value=n,r.connect(c),c.connect(l)}const u=new MediaRecorder(l.stream),f=[];return new Promise((c,d)=>{u.ondataavailable=y=>{y.data.size>0&&f.push(y.data)},u.onstop=()=>w(this,null,function*(){r.disconnect(),i.close();const B=yield new Blob(f,{type:"audio/webm"}).arrayBuffer(),G=new AudioContext;try{const A=yield G.decodeAudioData(B);s&&s(50);const V=yield D(A,o,s,50,100);c(V)}catch(A){d(A)}finally{G.close()}}),u.start(),r.start();const h=e.duration,v=setInterval(()=>{if(i.state==="closed"){clearInterval(v);return}const y=i.currentTime/h*50;s&&s(Math.min(49,y))},500);r.onended=()=>{clearInterval(v),setTimeout(()=>{u.stop()},100)}})})}function K(e){const t=e.numberOfChannels,n=e.length*t*2+44,o=new ArrayBuffer(n),s=new DataView(o),i=[];let a,r,l=0,u=0;for(d(1179011410),d(n-8),d(1163280727),d(544501094),d(16),c(1),c(t),d(e.sampleRate),d(e.sampleRate*2*t),c(t*2),c(16),d(1635017060),d(n-u-4),a=0;a<e.numberOfChannels;a++)i.push(e.getChannelData(a));let f=0;for(;f<e.length;){for(a=0;a<t;a++)r=Math.max(-1,Math.min(1,i[a][f])),r=(r<0?r*32768:r*32767)|0,s.setInt16(44+l,r,!0),l+=2;f++}return new Blob([o],{type:"audio/wav"});function c(h){s.setUint16(u,h,!0),u+=2}function d(h){s.setUint32(u,h,!0),u+=4}}const X=document.querySelector("#app");X.innerHTML=`
  <header>
    <h1>Voice De-noise</h1>
    <div class="subtitle">AI-Powered Noise Reduction</div>
  </header>

  <div class="tabs">
    <button class="tab-btn active" data-tab="tab-main">Home</button>
    <button class="tab-btn" data-tab="tab-settings">Settings</button>
  </div>

  <!-- Tab: Main -->
  <div id="tab-main" class="tab-content active">
      <div class="card">
        <div class="status-bar">
          <span>Status: <span id="statusText">Ready</span></span>
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

        <div class="preview-controls" style="margin-top: 1rem; display: none;" id="previewContainer">
            <button id="previewBtn" style="flex:1;">Preview Result (Play)</button>
        </div>

        <button id="processBtn" style="width:100%; margin-top:1rem;" disabled>Process & Download WAV</button>
      </div>
  </div>

  <!-- Tab: Settings -->
  <div id="tab-settings" class="tab-content">
      <div class="card">
        <h3>Audio Settings</h3>
        <div class="controls">
           <div class="control-group">
            <label for="eqGain">Clarify / Treble (dB)</label>
            <input type="range" id="eqGain" min="0" max="10" value="5" step="0.5">
            <span id="eqVal">5.0</span>
          </div>

          <div class="control-group">
            <label for="nrIntensity">Denoise Amount</label>
            <input type="range" id="nrIntensity" min="0" max="100" value="100" step="1">
            <span id="nrVal">100%</span>
          </div>

          <div class="control-group">
            <label for="targetLufs">Loudness Target</label>
            <select id="targetLufs">
                <option value="-24">Broadcast (-24 LUFS)</option>
                <option value="-16">Mobile / Podcast (-16 LUFS)</option>
                <option value="-14">Online / Streaming (-14 LUFS)</option>
            </select>
          </div>
        </div>
      </div>
  </div>
`;document.querySelectorAll(".tab-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active")),e.classList.add("active"),document.getElementById(e.dataset.tab).classList.add("active")})});const L=document.getElementById("statusText"),k=document.getElementById("fileInput"),p=document.getElementById("processBtn"),g=document.getElementById("fileStatus"),Y=document.getElementById("dropZoneText"),S=document.getElementById("previewBtn"),O=document.getElementById("previewContainer"),R=document.getElementById("eqGain"),J=document.getElementById("eqVal");let E=null,x=null,b=null,m=null,I=!1;const q=(e,t="normal")=>{L.textContent=e,L.className=t,t==="error"?L.style.color="var(--danger-color)":t==="success"?L.style.color="var(--success-color)":L.style.color="var(--text-muted)"},M=document.getElementById("nrIntensity"),ee=document.getElementById("nrVal"),te=document.getElementById("targetLufs");R.addEventListener("input",e=>{J.textContent=e.target.value});M.addEventListener("input",e=>{ee.textContent=e.target.value+"%"});const C=document.querySelector(".file-drop-zone");["dragenter","dragover","dragleave","drop"].forEach(e=>{C.addEventListener(e,ne,!1)});function ne(e){e.preventDefault(),e.stopPropagation()}["dragenter","dragover"].forEach(e=>{C.addEventListener(e,ie,!1)});["dragleave","drop"].forEach(e=>{C.addEventListener(e,se,!1)});function ie(e){C.classList.add("drag-over")}function se(e){C.classList.remove("drag-over")}C.addEventListener("drop",ae,!1);function ae(e){const n=e.dataTransfer.files;oe(n)}function oe(e){if(e.length>0){k.files=e;const t=new Event("change");k.dispatchEvent(t)}}k.addEventListener("change",e=>{e.target.files.length>0&&(E=e.target.files[0],Y.textContent=E.name,p.disabled=!1,g.textContent="Ready to process",x=null,W(),O.style.display="none",p.textContent="Process & Download WAV",p.onclick=P)});function P(){return w(this,null,function*(){if(E)try{p.disabled=!0,p.textContent="Processing...",q("Processing...","normal");const e=parseFloat(R.value),t=parseInt(M.value,10)/100,n=parseFloat(te.value);x=yield _(E,o=>{g.textContent=`Processing: ${o}%`},{eqDb:e,nrIntensity:t,targetLufs:n}),q("Complete","success"),g.textContent="Processing complete! You can now preview or download.",p.textContent="Download WAV",p.disabled=!1,O.style.display="flex",p.onclick=re}catch(e){console.error(e),q("Error","error"),g.textContent="Error processing file: "+e.message,p.disabled=!1}})}p.addEventListener("click",P);function re(){if(x)try{const e=K(x),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`denoised_${E.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),g.textContent="Download started!"}catch(e){console.error("Export Error",e),g.textContent="Error exporting WAV"}}S.addEventListener("click",()=>{I?W():ce()});function ce(){x&&(b=new(window.AudioContext||window.webkitAudioContext),m=b.createBufferSource(),m.buffer=x,m.connect(b.destination),m.onended=()=>{I=!1,S.textContent="Preview Result (Play)"},m.start(),I=!0,S.textContent="Stop Preview")}function W(){if(m){try{m.stop()}catch(e){}m=null}if(b){try{b.close()}catch(e){}b=null}I=!1,S.textContent="Preview Result (Play)"}
