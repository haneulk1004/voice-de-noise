var w=(e,t,n)=>new Promise((r,s)=>{var o=l=>{try{i(n.next(l))}catch(d){s(d)}},a=l=>{try{i(n.throw(l))}catch(d){s(d)}},i=l=>l.done?r(l.value):Promise.resolve(l.value).then(o,a);i((n=n.apply(e,t)).next())});(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();var ie="@sapphi-red/web-noise-suppressor/speex",re=class extends AudioWorkletNode{constructor(e,{maxChannels:t,wasmBinary:n}){const r={processorOptions:{maxChannels:t,wasmBinary:n}};super(e,ie,r)}destroy(){this.port.postMessage("destroy")}};const W="/voice-de-noise/assets/workletProcessor-_AMzdT6B.js",le="/voice-de-noise/assets/speex-BeXkxj2B.wasm";class _{constructor(){this.ctx=null,this.node=null,this.eqNode=null,this.source=null,this.destination=null,this.wasmBinary=null}init(t){return w(this,null,function*(){this.ctx=t;try{if(!this.wasmBinary){const n=yield fetch(le);this.wasmBinary=yield n.arrayBuffer()}return yield this.ctx.audioWorklet.addModule(W),this.node=new re(this.ctx,{wasmBinary:this.wasmBinary,maxChannels:2}),this.eqNode=this.ctx.createBiquadFilter(),this.eqNode.type="highshelf",this.eqNode.frequency.value=5e3,this.eqNode.gain.value=0,this.node.connect(this.eqNode),this.dryGain=this.ctx.createGain(),this.wetGain=this.ctx.createGain(),this.dryGain.gain.value=0,this.wetGain.gain.value=1,console.log("NoiseSuppressor initialized"),this.node}catch(n){throw console.error("Failed to initialize NoiseSuppressor:",n),n}})}connect(t,n){if(!this.node)throw new Error("NoiseSuppressor not initialized");this.source=t,this.destination=n,t.connect(this.dryGain),this.dryGain.connect(n),t.connect(this.node),this.eqNode.connect(this.wetGain),this.wetGain.connect(n)}disconnect(){this.node&&(this.node.disconnect(),this.eqNode.disconnect(),this.dryGain.disconnect(),this.wetGain.disconnect())}setBypass(t){this.setIntensity(t?0:1)}setIntensity(t){if(!this.dryGain||!this.wetGain)return;const n=Math.max(0,Math.min(1,t)),r=1-n;this.dryGain.gain.setTargetAtTime(r,this.ctx.currentTime,.1),this.wetGain.gain.setTargetAtTime(n,this.ctx.currentTime,.1)}setEQ(t){this.eqNode&&this.eqNode.gain.setTargetAtTime(t,this.ctx.currentTime,.1)}setParams(t){console.log("Params updated:",t)}}function U(e){const t=e.numberOfChannels;let n=0,r=0;for(let i=0;i<t;i++){const l=e.getChannelData(i);for(let d=0;d<l.length;d++)n+=l[d]*l[d];r+=l.length}const s=Math.sqrt(n/r);return s===0?-100:20*Math.log10(s)-.7}function H(e,t){let n=t-e;return n>30&&(console.warn(`⚠️ Clamping gain from ${n.toFixed(2)}dB to +30dB to prevent excessive boost`),n=30),n<-20&&(console.warn(`⚠️ Clamping gain from ${n.toFixed(2)}dB to -20dB`),n=-20),n}function ce(e){const t=e.createDynamicsCompressor();return t.threshold.value=-.5,t.knee.value=0,t.ratio.value=20,t.attack.value=.003,t.release.value=.05,t}function K(e,t,n){const r=e.createGain(),s=ce(e),o=Math.pow(10,n/20);return r.gain.value=o,t.connect(r),r.connect(s),{input:r,output:s}}function de(r,s){return w(this,arguments,function*(e,t,n={}){let o=5,a=1,i=-24;typeof n=="number"?o=n:typeof n=="object"&&(n.eqDb!==void 0&&(o=n.eqDb),n.nrIntensity!==void 0&&(a=n.nrIntensity),n.targetLufs!==void 0&&(i=n.targetLufs));const l=yield e.arrayBuffer(),f=yield new AudioContext().decodeAudioData(l),c=window.OfflineAudioContext||window.webkitOfflineAudioContext,u=new c(f.numberOfChannels,f.length,f.sampleRate);if(!u.audioWorklet)return console.warn("OfflineAudioContext missing audioWorklet. Switching to Real-time Fallback."),j(f,a,o,i,t);try{yield u.audioWorklet.addModule(W)}catch(G){return console.warn("Failed to add worklet to OfflineCtx. Switching to Real-time Fallback.",G),j(f,a,o,i,t)}const m=u.createBufferSource();m.buffer=f;const h=new _;yield h.init(u),console.log(`Processing with: Intensity=${a}, EQ=${o}dB, Channels=${f.numberOfChannels}`),h.setIntensity(a),h.setEQ(o),h.connect(m,u.destination),m.start(),t&&t(10);const v=u.startRendering(),x=f.duration*1e3,p=Date.now(),S=setInterval(()=>{const G=Date.now()-p,ae=Math.min(45,10+G/x*35);t&&t(Math.floor(ae))},100),T=yield v;clearInterval(S);const Z=U(T);return Z<-90?(console.error(`⚠️ Denoise output is silent (${Z.toFixed(2)} LUFS)! Using original audio instead.`),$(f,i,t,50,100)):(t&&t(50),$(T,i,t,50,100))})}function $(e,t,n,r,s){return w(this,null,function*(){const o=U(e),a=H(o,t);console.log(`Loudness: ${o.toFixed(2)} LUFS, Target: ${t}, Gain: ${a.toFixed(2)}dB`);const i=window.OfflineAudioContext||window.webkitOfflineAudioContext,l=new i(e.numberOfChannels,e.length,e.sampleRate),d=l.createBufferSource();d.buffer=e;const{output:f}=K(l,d,a);f.connect(l.destination),d.start();const c=l.startRendering(),u=Date.now(),h=e.duration*500,v=setInterval(()=>{const x=Date.now()-u,p=Math.min(s-1,r+x/h*(s-r));n&&n(Math.floor(p))},100),b=yield c;return clearInterval(v),n&&n(s),b})}function j(e,t,n,r,s){return w(this,null,function*(){console.log("Starting Real-time Fallback Processing...");const o=new AudioContext;let a=!0;try{yield o.audioWorklet.addModule(W)}catch(c){console.warn("AudioWorklet not supported even in Real-time. Skipping Denoise step.",c),a=!1}const i=o.createBufferSource();i.buffer=e;const l=o.createMediaStreamDestination();if(a){const c=new _;yield c.init(o),c.connect(i,l),c.setIntensity(t),c.setEQ(n)}else{const c=o.createBiquadFilter();c.type="highshelf",c.frequency.value=3e3,c.gain.value=n,i.connect(c),c.connect(l)}const d=new MediaRecorder(l.stream),f=[];return new Promise((c,u)=>{d.ondataavailable=v=>{v.data.size>0&&f.push(v.data)},d.onstop=()=>w(this,null,function*(){i.disconnect(),o.close();const b=yield new Blob(f,{type:"audio/webm"}).arrayBuffer(),x=new AudioContext;try{const p=yield x.decodeAudioData(b);s&&s(50);const S=yield $(p,r,s,50,100);c(S)}catch(p){u(p)}finally{x.close()}}),d.start(),i.start();const m=e.duration,h=setInterval(()=>{if(o.state==="closed"){clearInterval(h);return}const v=Math.floor(o.currentTime/m*50);s&&s(Math.min(49,v))},200);i.onended=()=>{clearInterval(h),setTimeout(()=>{d.stop()},100)}})})}function ue(e,t,n=-16){return w(this,null,function*(){t&&t(5);const r=yield e.arrayBuffer(),s=new AudioContext,o=yield s.decodeAudioData(r);s.close();const a=o.length,i=o.duration;console.log(`Original: ${a} samples, ${i.toFixed(2)}s, ${o.numberOfChannels}ch, ${o.sampleRate}Hz`),t&&t(20);const l=U(o),d=H(l,n);console.log(`Loudness: Current=${l.toFixed(2)} LUFS, Target=${n} LUFS, Gain=${d.toFixed(2)}dB`),t&&t(40);const f=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new f(o.numberOfChannels,o.length,o.sampleRate),u=c.createBufferSource();u.buffer=o;const{output:m}=K(c,u,d);m.connect(c.destination),u.start(),t&&t(60);const h=Date.now(),b=o.duration*500,x=setInterval(()=>{const S=Date.now()-h,T=Math.min(95,60+S/b*35);t&&t(Math.floor(T))},100),p=yield c.startRendering();return clearInterval(x),console.log(`Output: ${p.length} samples, ${p.duration.toFixed(2)}s (Original was ${a} samples, ${i.toFixed(2)}s)`),p.length!==a&&console.warn(`⚠️ Length mismatch! Output is ${(p.length/a*100).toFixed(1)}% of original`),t&&t(100),p})}function X(e){const t=e.numberOfChannels,n=e.length*t*2+44,r=new ArrayBuffer(n),s=new DataView(r),o=[];let a,i,l=0,d=0;for(u(1179011410),u(n-8),u(1163280727),u(544501094),u(16),c(1),c(t),u(e.sampleRate),u(e.sampleRate*2*t),c(t*2),c(16),u(1635017060),u(n-d-4),a=0;a<e.numberOfChannels;a++)o.push(e.getChannelData(a));let f=0;for(;f<e.length;){for(a=0;a<t;a++)i=Math.max(-1,Math.min(1,o[a][f])),i=(i<0?i*32768:i*32767)|0,s.setInt16(44+l,i,!0),l+=2;f++}return new Blob([r],{type:"audio/wav"});function c(m){s.setUint16(d,m,!0),d+=2}function u(m){s.setUint32(d,m,!0),d+=4}}const fe=document.querySelector("#app");fe.innerHTML=`
  <header>
    <h1>Voice De-noise</h1>
    <div class="subtitle">AI-Powered Noise Reduction</div>
  </header>

  <div class="tabs">
    <button class="tab-btn active" data-tab="tab-main">De-noise</button>
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
            <input type="range" id="nrIntensity" min="0" max="100" value="50" step="1">
            <span id="nrVal">50%</span>
          </div>
        </div>
      </div>
  </div>

  <!-- Tab: Loudness -->
  <div id="tab-loudness" class="tab-content">
      <div class="card status-card">
        <span>Status: <span id="loudnessStatusText">Ready</span></span>
      </div>

      <div class="card main-card">
        <h3>Loudness Normalization</h3>
        <div class="file-upload-area">
          <label for="loudnessFileInput" class="file-drop-zone" id="loudnessDropZone">
            <span id="loudnessDropZoneText">Click to Select Audio File</span>
          </label>
          <input type="file" id="loudnessFileInput" accept="audio/*">
        </div>
        <div id="loudnessFileStatus"></div>

        <button id="loudnessProcessBtn" class="btn-primary" disabled>Normalize & Download WAV</button>
      </div>

      <div class="card">
        <h3>Settings</h3>
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
`;document.querySelectorAll(".tab-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active")),e.classList.add("active"),document.getElementById(e.dataset.tab).classList.add("active")})});const B=document.getElementById("statusText"),R=document.getElementById("fileInput"),g=document.getElementById("processBtn"),C=document.getElementById("fileStatus"),pe=document.getElementById("dropZoneText"),V=document.getElementById("eqGain"),J=document.getElementById("eqVal");let F=null,O=null;const N=(e,t="normal")=>{B.textContent=e,B.className=t,t==="error"?B.style.color="var(--danger-color)":t==="success"?B.style.color="var(--success-color)":B.style.color="var(--text-muted)"},P=document.getElementById("nrIntensity"),Y=document.getElementById("nrVal"),ee=document.getElementById("targetLufs"),D=document.getElementById("modePreset"),Q={dialogue:{eqGain:5,nrIntensity:50,description:"Optimized for voice clarity with natural sound"},gentle:{eqGain:2,nrIntensity:30,description:"Subtle noise reduction, preserves most original audio"},surgical:{eqGain:8,nrIntensity:80,description:"Maximum noise removal, may affect voice quality"}};function te(e){if(Q[e]){const t=Q[e];V.value=t.eqGain,J.textContent=t.eqGain.toFixed(1),P.value=t.nrIntensity,Y.textContent=t.nrIntensity+"%"}}D.addEventListener("change",e=>{const t=e.target.value;t!=="custom"&&te(t)});V.addEventListener("input",e=>{J.textContent=parseFloat(e.target.value).toFixed(1),D.value!=="custom"&&(D.value="custom")});P.addEventListener("input",e=>{Y.textContent=e.target.value+"%",D.value!=="custom"&&(D.value="custom")});te("dialogue");const I=document.querySelector(".file-drop-zone");["dragenter","dragover","dragleave","drop"].forEach(e=>{I.addEventListener(e,ne,!1)});function ne(e){e.preventDefault(),e.stopPropagation()}["dragenter","dragover"].forEach(e=>{I.addEventListener(e,me,!1)});["dragleave","drop"].forEach(e=>{I.addEventListener(e,he,!1)});function me(e){I.classList.add("drag-over")}function he(e){I.classList.remove("drag-over")}I.addEventListener("drop",ve,!1);function ve(e){const n=e.dataTransfer.files;ge(n)}function ge(e){if(e.length>0){R.files=e;const t=new Event("change");R.dispatchEvent(t)}}R.addEventListener("change",e=>{e.target.files.length>0&&(F=e.target.files[0],pe.textContent=F.name,g.disabled=!1,C.textContent="Ready to process",O=null,g.textContent="Process & Download WAV",g.onclick=oe)});function oe(){return w(this,null,function*(){if(F)try{g.disabled=!0,g.textContent="Processing...",N("Processing...","normal");const e=parseFloat(V.value),t=parseInt(P.value,10)/100,n=parseFloat(ee.value);O=yield de(F,r=>{C.textContent=`Processing: ${r}%`},{eqDb:e,nrIntensity:t,targetLufs:n}),N("Complete","success"),C.textContent="Processing complete! Click to download.",g.textContent="Download WAV",g.disabled=!1,g.onclick=ye}catch(e){console.error(e),N("Error","error"),C.textContent="Error processing file: "+e.message,g.disabled=!1}})}g.addEventListener("click",oe);function ye(){if(O)try{const e=X(O),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`denoised_${F.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),C.textContent="Download started!"}catch(e){console.error("Export Error",e),C.textContent="Error exporting WAV"}}const q=document.getElementById("loudnessStatusText"),z=document.getElementById("loudnessFileInput"),y=document.getElementById("loudnessProcessBtn"),L=document.getElementById("loudnessFileStatus"),we=document.getElementById("loudnessDropZoneText"),E=document.getElementById("loudnessDropZone");let A=null,k=null;const M=(e,t="normal")=>{q.textContent=e,t==="error"?q.style.color="var(--danger-color)":t==="success"?q.style.color="var(--success-color)":q.style.color="var(--text-muted)"};["dragenter","dragover","dragleave","drop"].forEach(e=>{E.addEventListener(e,ne,!1)});["dragenter","dragover"].forEach(e=>{E.addEventListener(e,()=>{E.classList.add("drag-over")},!1)});["dragleave","drop"].forEach(e=>{E.addEventListener(e,()=>{E.classList.remove("drag-over")},!1)});E.addEventListener("drop",e=>{const n=e.dataTransfer.files;if(n.length>0){z.files=n;const r=new Event("change");z.dispatchEvent(r)}},!1);z.addEventListener("change",e=>{e.target.files.length>0&&(A=e.target.files[0],we.textContent=A.name,y.disabled=!1,L.textContent="Ready to normalize",k=null,y.textContent="Normalize & Download WAV",y.onclick=se)});function se(){return w(this,null,function*(){if(A)try{y.disabled=!0,y.textContent="Processing...",M("Normalizing...","normal");const e=parseFloat(ee.value);k=yield ue(A,t=>{L.textContent=`Normalizing: ${t}%`},e),M("Complete","success"),L.textContent="Normalization complete! Click to download.",y.textContent="Download WAV",y.disabled=!1,y.onclick=xe}catch(e){console.error(e),M("Error","error"),L.textContent="Error normalizing file: "+e.message,y.disabled=!1}})}y.addEventListener("click",se);function xe(){if(k)try{const e=X(k),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`normalized_${A.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),L.textContent="Download started!"}catch(e){console.error("Export Error",e),L.textContent="Error exporting WAV"}}
