var y=(e,t,n)=>new Promise((r,s)=>{var o=l=>{try{i(n.next(l))}catch(d){s(d)}},a=l=>{try{i(n.throw(l))}catch(d){s(d)}},i=l=>l.done?r(l.value):Promise.resolve(l.value).then(o,a);i((n=n.apply(e,t)).next())});(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();var we="@sapphi-red/web-noise-suppressor/speex",ge=class extends AudioWorkletNode{constructor(e,{maxChannels:t,wasmBinary:n}){const r={processorOptions:{maxChannels:t,wasmBinary:n}};super(e,we,r)}destroy(){this.port.postMessage("destroy")}};const _="/voice-de-noise/assets/workletProcessor-_AMzdT6B.js",ye="/voice-de-noise/assets/speex-BeXkxj2B.wasm";class J{constructor(){this.ctx=null,this.node=null,this.eqNode=null,this.source=null,this.destination=null,this.wasmBinary=null}init(t){return y(this,null,function*(){this.ctx=t;try{if(!this.wasmBinary){const n=yield fetch(ye);this.wasmBinary=yield n.arrayBuffer()}return yield this.ctx.audioWorklet.addModule(_),this.node=new ge(this.ctx,{wasmBinary:this.wasmBinary,maxChannels:2}),this.eqNode=this.ctx.createBiquadFilter(),this.eqNode.type="highshelf",this.eqNode.frequency.value=5e3,this.eqNode.gain.value=0,this.node.connect(this.eqNode),this.dryGain=this.ctx.createGain(),this.wetGain=this.ctx.createGain(),this.dryGain.gain.value=0,this.wetGain.gain.value=1,console.log("NoiseSuppressor initialized"),this.node}catch(n){throw console.error("Failed to initialize NoiseSuppressor:",n),n}})}connect(t,n){if(!this.node)throw new Error("NoiseSuppressor not initialized");this.source=t,this.destination=n,t.connect(this.dryGain),this.dryGain.connect(n),t.connect(this.node),this.eqNode.connect(this.wetGain),this.wetGain.connect(n)}disconnect(){this.node&&(this.node.disconnect(),this.eqNode.disconnect(),this.dryGain.disconnect(),this.wetGain.disconnect())}setBypass(t){this.setIntensity(t?0:1)}setIntensity(t){if(!this.dryGain||!this.wetGain)return;const n=Math.max(0,Math.min(1,t)),r=1-n;this.dryGain.gain.setTargetAtTime(r,this.ctx.currentTime,.1),this.wetGain.gain.setTargetAtTime(n,this.ctx.currentTime,.1)}setEQ(t){this.eqNode&&this.eqNode.gain.setTargetAtTime(t,this.ctx.currentTime,.1)}setParams(t){console.log("Params updated:",t)}}function ee(e){const t=e.numberOfChannels;let n=0,r=0;for(let i=0;i<t;i++){const l=e.getChannelData(i);for(let d=0;d<l.length;d++)n+=l[d]*l[d];r+=l.length}const s=Math.sqrt(n/r);return s===0?-100:20*Math.log10(s)-.7}function te(e,t){let n=t-e;return n>15&&(console.warn(`⚠️ Clamping gain from ${n.toFixed(2)}dB to +15dB to prevent clipping`),n=15),n<-20&&(console.warn(`⚠️ Clamping gain from ${n.toFixed(2)}dB to -20dB`),n=-20),n}function xe(e){const t=e.createDynamicsCompressor();return t.threshold.value=-.5,t.knee.value=0,t.ratio.value=20,t.attack.value=.003,t.release.value=.05,t}function ne(e,t,n){const r=e.createGain(),s=xe(e),o=Math.pow(10,n/20);return r.gain.value=o,t.connect(r),r.connect(s),{input:r,output:s}}function be(r,s){return y(this,arguments,function*(e,t,n={}){let o=5,a=1,i=-24;typeof n=="number"?o=n:typeof n=="object"&&(n.eqDb!==void 0&&(o=n.eqDb),n.nrIntensity!==void 0&&(a=n.nrIntensity),n.targetLufs!==void 0&&(i=n.targetLufs));const l=yield e.arrayBuffer(),f=yield new AudioContext().decodeAudioData(l),c=window.OfflineAudioContext||window.webkitOfflineAudioContext,u=new c(f.numberOfChannels,f.length,f.sampleRate);if(!u.audioWorklet)return console.warn("OfflineAudioContext missing audioWorklet. Switching to Real-time Fallback."),K(f,a,o,i,t);try{yield u.audioWorklet.addModule(_)}catch(V){return console.warn("Failed to add worklet to OfflineCtx. Switching to Real-time Fallback.",V),K(f,a,o,i,t)}const m=u.createBufferSource();m.buffer=f;const v=new J;yield v.init(u),console.log(`Processing with: Intensity=${a}, EQ=${o}dB, Channels=${f.numberOfChannels}`),v.setIntensity(a),v.setEQ(o),v.connect(m,u.destination),m.start(),t&&t(10);const h=u.startRendering(),x=f.duration*1e3,p=Date.now(),q=setInterval(()=>{const V=Date.now()-p,he=Math.min(45,10+V/x*35);t&&t(Math.floor(he))},100),W=yield h;return clearInterval(q),t&&t(50),oe(W,i,t,50,100)})}function oe(e,t,n,r,s){return y(this,null,function*(){const o=ee(e),a=te(o,t);console.log(`Loudness: ${o.toFixed(2)} LUFS, Target: ${t}, Gain: ${a.toFixed(2)}dB`);const i=window.OfflineAudioContext||window.webkitOfflineAudioContext,l=new i(e.numberOfChannels,e.length,e.sampleRate),d=l.createBufferSource();d.buffer=e;const{output:f}=ne(l,d,a);f.connect(l.destination),d.start();const c=l.startRendering(),u=Date.now(),v=e.duration*500,h=setInterval(()=>{const x=Date.now()-u,p=Math.min(s-1,r+x/v*(s-r));n&&n(Math.floor(p))},100),E=yield c;return clearInterval(h),n&&n(s),E})}function K(e,t,n,r,s){return y(this,null,function*(){console.log("Starting Real-time Fallback Processing...");const o=new AudioContext;let a=!0;try{yield o.audioWorklet.addModule(_)}catch(c){console.warn("AudioWorklet not supported even in Real-time. Skipping Denoise step.",c),a=!1}const i=o.createBufferSource();i.buffer=e;const l=o.createMediaStreamDestination();if(a){const c=new J;yield c.init(o),c.connect(i,l),c.setIntensity(t),c.setEQ(n)}else{const c=o.createBiquadFilter();c.type="highshelf",c.frequency.value=3e3,c.gain.value=n,i.connect(c),c.connect(l)}const d=new MediaRecorder(l.stream),f=[];return new Promise((c,u)=>{d.ondataavailable=h=>{h.data.size>0&&f.push(h.data)},d.onstop=()=>y(this,null,function*(){i.disconnect(),o.close();const E=yield new Blob(f,{type:"audio/webm"}).arrayBuffer(),x=new AudioContext;try{const p=yield x.decodeAudioData(E);s&&s(50);const q=yield oe(p,r,s,50,100);c(q)}catch(p){u(p)}finally{x.close()}}),d.start(),i.start();const m=e.duration,v=setInterval(()=>{if(o.state==="closed"){clearInterval(v);return}const h=Math.floor(o.currentTime/m*50);s&&s(Math.min(49,h))},200);i.onended=()=>{clearInterval(v),setTimeout(()=>{d.stop()},100)}})})}function Ce(e,t,n=-16){return y(this,null,function*(){t&&t(5);const r=yield e.arrayBuffer(),s=new AudioContext,o=yield s.decodeAudioData(r);s.close();const a=o.length,i=o.duration;console.log(`Original: ${a} samples, ${i.toFixed(2)}s, ${o.numberOfChannels}ch, ${o.sampleRate}Hz`),t&&t(20);const l=ee(o),d=te(l,n);console.log(`Loudness: Current=${l.toFixed(2)} LUFS, Target=${n} LUFS, Gain=${d.toFixed(2)}dB`),t&&t(40);const f=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new f(o.numberOfChannels,o.length,o.sampleRate),u=c.createBufferSource();u.buffer=o;const{output:m}=ne(c,u,d);m.connect(c.destination),u.start(),t&&t(60);const v=Date.now(),E=o.duration*500,x=setInterval(()=>{const q=Date.now()-v,W=Math.min(95,60+q/E*35);t&&t(Math.floor(W))},100),p=yield c.startRendering();return clearInterval(x),console.log(`Output: ${p.length} samples, ${p.duration.toFixed(2)}s (Original was ${a} samples, ${i.toFixed(2)}s)`),p.length!==a&&console.warn(`⚠️ Length mismatch! Output is ${(p.length/a*100).toFixed(1)}% of original`),t&&t(100),p})}function se(e){const t=e.numberOfChannels,n=e.length*t*2+44,r=new ArrayBuffer(n),s=new DataView(r),o=[];let a,i,l=0,d=0;for(u(1179011410),u(n-8),u(1163280727),u(544501094),u(16),c(1),c(t),u(e.sampleRate),u(e.sampleRate*2*t),c(t*2),c(16),u(1635017060),u(n-d-4),a=0;a<e.numberOfChannels;a++)o.push(e.getChannelData(a));let f=0;for(;f<e.length;){for(a=0;a<t;a++)i=Math.max(-1,Math.min(1,o[a][f])),i=(i<0?i*32768:i*32767)|0,s.setInt16(44+l,i,!0),l+=2;f++}return new Blob([r],{type:"audio/wav"});function c(m){s.setUint16(d,m,!0),d+=2}function u(m){s.setUint32(d,m,!0),d+=4}}const Ee=document.querySelector("#app");Ee.innerHTML=`
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

        <div class="preview-controls" id="loudnessPreviewContainer">
            <button id="loudnessPreviewBtn" class="btn-secondary">Preview Result</button>
        </div>

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
`;document.querySelectorAll(".tab-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active")),e.classList.add("active"),document.getElementById(e.dataset.tab).classList.add("active")})});const O=document.getElementById("statusText"),j=document.getElementById("fileInput"),w=document.getElementById("processBtn"),L=document.getElementById("fileStatus"),Le=document.getElementById("dropZoneText"),N=document.getElementById("previewBtn"),ae=document.getElementById("previewContainer"),H=document.getElementById("eqGain"),ie=document.getElementById("eqVal");let k=null,F=null,I=null,b=null,M=!1;const U=(e,t="normal")=>{O.textContent=e,O.className=t,t==="error"?O.style.color="var(--danger-color)":t==="success"?O.style.color="var(--success-color)":O.style.color="var(--text-muted)"},Y=document.getElementById("nrIntensity"),re=document.getElementById("nrVal"),le=document.getElementById("targetLufs"),P=document.getElementById("modePreset"),X={dialogue:{eqGain:5,nrIntensity:50,description:"Optimized for voice clarity with natural sound"},gentle:{eqGain:2,nrIntensity:30,description:"Subtle noise reduction, preserves most original audio"},surgical:{eqGain:8,nrIntensity:80,description:"Maximum noise removal, may affect voice quality"}};function ce(e){if(X[e]){const t=X[e];H.value=t.eqGain,ie.textContent=t.eqGain.toFixed(1),Y.value=t.nrIntensity,re.textContent=t.nrIntensity+"%"}}P.addEventListener("change",e=>{const t=e.target.value;t!=="custom"&&ce(t)});H.addEventListener("input",e=>{ie.textContent=parseFloat(e.target.value).toFixed(1),P.value!=="custom"&&(P.value="custom")});Y.addEventListener("input",e=>{re.textContent=e.target.value+"%",P.value!=="custom"&&(P.value="custom")});ce("dialogue");const T=document.querySelector(".file-drop-zone");["dragenter","dragover","dragleave","drop"].forEach(e=>{T.addEventListener(e,de,!1)});function de(e){e.preventDefault(),e.stopPropagation()}["dragenter","dragover"].forEach(e=>{T.addEventListener(e,Ie,!1)});["dragleave","drop"].forEach(e=>{T.addEventListener(e,Be,!1)});function Ie(e){T.classList.add("drag-over")}function Be(e){T.classList.remove("drag-over")}T.addEventListener("drop",Se,!1);function Se(e){const n=e.dataTransfer.files;Fe(n)}function Fe(e){if(e.length>0){j.files=e;const t=new Event("change");j.dispatchEvent(t)}}j.addEventListener("change",e=>{e.target.files.length>0&&(k=e.target.files[0],Le.textContent=k.name,w.disabled=!1,L.textContent="Ready to process",F=null,fe(),ae.style.display="none",w.textContent="Process & Download WAV",w.onclick=ue)});function ue(){return y(this,null,function*(){if(k)try{w.disabled=!0,w.textContent="Processing...",U("Processing...","normal");const e=parseFloat(H.value),t=parseInt(Y.value,10)/100,n=parseFloat(le.value);F=yield be(k,r=>{L.textContent=`Processing: ${r}%`},{eqDb:e,nrIntensity:t,targetLufs:n}),U("Complete","success"),L.textContent="Processing complete! You can now preview or download.",w.textContent="Download WAV",w.disabled=!1,ae.style.display="flex",w.onclick=De}catch(e){console.error(e),U("Error","error"),L.textContent="Error processing file: "+e.message,w.disabled=!1}})}w.addEventListener("click",ue);function De(){if(F)try{const e=se(F),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`denoised_${k.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),L.textContent="Download started!"}catch(e){console.error("Export Error",e),L.textContent="Error exporting WAV"}}N.addEventListener("click",()=>{M?fe():Ae()});function Ae(){F&&(I=new(window.AudioContext||window.webkitAudioContext),b=I.createBufferSource(),b.buffer=F,b.connect(I.destination),b.onended=()=>{M=!1,N.textContent="Preview Result (Play)"},b.start(),M=!0,N.textContent="Stop Preview")}function fe(){if(b){try{b.stop()}catch(e){}b=null}if(I){try{I.close()}catch(e){}I=null}M=!1,N.textContent="Preview Result (Play)"}const R=document.getElementById("loudnessStatusText"),Q=document.getElementById("loudnessFileInput"),g=document.getElementById("loudnessProcessBtn"),B=document.getElementById("loudnessFileStatus"),Te=document.getElementById("loudnessDropZoneText"),$=document.getElementById("loudnessPreviewBtn"),pe=document.getElementById("loudnessPreviewContainer"),D=document.getElementById("loudnessDropZone");let G=null,A=null,S=null,C=null,z=!1;const Z=(e,t="normal")=>{R.textContent=e,t==="error"?R.style.color="var(--danger-color)":t==="success"?R.style.color="var(--success-color)":R.style.color="var(--text-muted)"};["dragenter","dragover","dragleave","drop"].forEach(e=>{D.addEventListener(e,de,!1)});["dragenter","dragover"].forEach(e=>{D.addEventListener(e,()=>{D.classList.add("drag-over")},!1)});["dragleave","drop"].forEach(e=>{D.addEventListener(e,()=>{D.classList.remove("drag-over")},!1)});D.addEventListener("drop",e=>{const n=e.dataTransfer.files;if(n.length>0){Q.files=n;const r=new Event("change");Q.dispatchEvent(r)}},!1);Q.addEventListener("change",e=>{e.target.files.length>0&&(G=e.target.files[0],Te.textContent=G.name,g.disabled=!1,B.textContent="Ready to normalize",A=null,ve(),pe.style.display="none",g.textContent="Normalize & Download WAV",g.onclick=me)});function me(){return y(this,null,function*(){if(G)try{g.disabled=!0,g.textContent="Processing...",Z("Normalizing...","normal");const e=parseFloat(le.value);A=yield Ce(G,t=>{B.textContent=`Normalizing: ${t}%`},e),Z("Complete","success"),B.textContent="Normalization complete! You can now preview or download.",g.textContent="Download WAV",g.disabled=!1,pe.style.display="flex",g.onclick=qe}catch(e){console.error(e),Z("Error","error"),B.textContent="Error normalizing file: "+e.message,g.disabled=!1}})}g.addEventListener("click",me);function qe(){if(A)try{const e=se(A),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`normalized_${G.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),B.textContent="Download started!"}catch(e){console.error("Export Error",e),B.textContent="Error exporting WAV"}}$.addEventListener("click",()=>{z?ve():Oe()});function Oe(){A&&(S=new(window.AudioContext||window.webkitAudioContext),C=S.createBufferSource(),C.buffer=A,C.connect(S.destination),C.onended=()=>{z=!1,$.textContent="Preview Result"},C.start(),z=!0,$.textContent="Stop Preview")}function ve(){if(C){try{C.stop()}catch(e){}C=null}if(S){try{S.close()}catch(e){}S=null}z=!1,$.textContent="Preview Result"}
