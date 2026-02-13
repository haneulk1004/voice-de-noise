var g=(e,t,n)=>new Promise((i,s)=>{var o=d=>{try{r(n.next(d))}catch(c){s(c)}},a=d=>{try{r(n.throw(d))}catch(c){s(c)}},r=d=>d.done?i(d.value):Promise.resolve(d.value).then(o,a);r((n=n.apply(e,t)).next())});(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();var we="@sapphi-red/web-noise-suppressor/speex",ye=class extends AudioWorkletNode{constructor(e,{maxChannels:t,wasmBinary:n}){const i={processorOptions:{maxChannels:t,wasmBinary:n}};super(e,we,i)}destroy(){this.port.postMessage("destroy")}};const Q="/voice-de-noise/assets/workletProcessor-_AMzdT6B.js",ge="/voice-de-noise/assets/speex-BeXkxj2B.wasm";class X{constructor(){this.ctx=null,this.node=null,this.eqNode=null,this.source=null,this.destination=null,this.wasmBinary=null}init(t){return g(this,null,function*(){this.ctx=t;try{if(!this.wasmBinary){const n=yield fetch(ge);this.wasmBinary=yield n.arrayBuffer()}return yield this.ctx.audioWorklet.addModule(Q),this.node=new ye(this.ctx,{wasmBinary:this.wasmBinary,maxChannels:1}),this.eqNode=this.ctx.createBiquadFilter(),this.eqNode.type="highshelf",this.eqNode.frequency.value=5e3,this.eqNode.gain.value=0,this.node.connect(this.eqNode),this.dryGain=this.ctx.createGain(),this.wetGain=this.ctx.createGain(),this.dryGain.gain.value=0,this.wetGain.gain.value=1,console.log("NoiseSuppressor initialized"),this.node}catch(n){throw console.error("Failed to initialize NoiseSuppressor:",n),n}})}connect(t,n){if(!this.node)throw new Error("NoiseSuppressor not initialized");this.source=t,this.destination=n,t.connect(this.dryGain),this.dryGain.connect(n),t.connect(this.node),this.eqNode.connect(this.wetGain),this.wetGain.connect(n)}disconnect(){this.node&&(this.node.disconnect(),this.eqNode.disconnect(),this.dryGain.disconnect(),this.wetGain.disconnect())}setBypass(t){this.setIntensity(t?0:1)}setIntensity(t){if(!this.dryGain||!this.wetGain)return;const n=Math.max(0,Math.min(1,t)),i=1-n;this.dryGain.gain.setTargetAtTime(i,this.ctx.currentTime,.1),this.wetGain.gain.setTargetAtTime(n,this.ctx.currentTime,.1)}setEQ(t){this.eqNode&&this.eqNode.gain.setTargetAtTime(t,this.ctx.currentTime,.1)}setParams(t){console.log("Params updated:",t)}}function J(e){const t=e.getChannelData(0);let n=0;for(let a=0;a<t.length;a++)n+=t[a]*t[a];const i=Math.sqrt(n/t.length);return i===0?-100:20*Math.log10(i)-.691}function ee(e,t){let n=t-e;return n>20&&(n=20),n<-20&&(n=-20),n}function xe(e){const t=e.createDynamicsCompressor();return t.threshold.value=-1,t.knee.value=0,t.ratio.value=20,t.attack.value=.001,t.release.value=.1,t}function te(e,t,n){const i=e.createGain(),s=xe(e),o=Math.pow(10,n/20);return i.gain.value=o,t.connect(i),i.connect(s),{input:i,output:s}}function be(i,s){return g(this,arguments,function*(e,t,n={}){let o=5,a=1,r=-24;typeof n=="number"?o=n:typeof n=="object"&&(n.eqDb!==void 0&&(o=n.eqDb),n.nrIntensity!==void 0&&(a=n.nrIntensity),n.targetLufs!==void 0&&(r=n.targetLufs));const d=yield e.arrayBuffer(),f=yield new AudioContext().decodeAudioData(d),l=window.OfflineAudioContext||window.webkitOfflineAudioContext,u=new l(f.numberOfChannels,f.length,f.sampleRate);if(!u.audioWorklet)return console.warn("OfflineAudioContext missing audioWorklet. Switching to Real-time Fallback."),Y(f,a,o,r,t);try{yield u.audioWorklet.addModule(Q)}catch(V){return console.warn("Failed to add worklet to OfflineCtx. Switching to Real-time Fallback.",V),Y(f,a,o,r,t)}const p=u.createBufferSource();p.buffer=f;const m=new X;yield m.init(u),m.connect(p,u.destination),m.setIntensity(a),m.setEQ(o),p.start(),t&&t(10);const v=u.startRendering(),x=f.duration*1e3,y=Date.now(),W=setInterval(()=>{const V=Date.now()-y,he=Math.min(45,10+V/x*35);t&&t(Math.floor(he))},100),ve=yield v;return clearInterval(W),t&&t(50),ne(ve,r,t,50,100)})}function ne(e,t,n,i,s){return g(this,null,function*(){const o=J(e),a=ee(o,t);console.log(`Loudness: ${o.toFixed(2)} LUFS, Target: ${t}, Gain: ${a.toFixed(2)}dB`);const r=window.OfflineAudioContext||window.webkitOfflineAudioContext,d=new r(e.numberOfChannels,e.length,e.sampleRate),c=d.createBufferSource();c.buffer=e;const{output:f}=te(d,c,a);f.connect(d.destination),c.start();const l=d.startRendering(),u=Date.now(),m=e.duration*500,v=setInterval(()=>{const x=Date.now()-u,y=Math.min(s-1,i+x/m*(s-i));n&&n(Math.floor(y))},100),E=yield l;return clearInterval(v),n&&n(s),E})}function Y(e,t,n,i,s){return g(this,null,function*(){console.log("Starting Real-time Fallback Processing...");const o=new AudioContext;let a=!0;try{yield o.audioWorklet.addModule(Q)}catch(l){console.warn("AudioWorklet not supported even in Real-time. Skipping Denoise step.",l),a=!1}const r=o.createBufferSource();r.buffer=e;const d=o.createMediaStreamDestination();if(a){const l=new X;yield l.init(o),l.connect(r,d),l.setIntensity(t),l.setEQ(n)}else{const l=o.createBiquadFilter();l.type="highshelf",l.frequency.value=3e3,l.gain.value=n,r.connect(l),l.connect(d)}const c=new MediaRecorder(d.stream),f=[];return new Promise((l,u)=>{c.ondataavailable=v=>{v.data.size>0&&f.push(v.data)},c.onstop=()=>g(this,null,function*(){r.disconnect(),o.close();const E=yield new Blob(f,{type:"audio/webm"}).arrayBuffer(),x=new AudioContext;try{const y=yield x.decodeAudioData(E);s&&s(50);const W=yield ne(y,i,s,50,100);l(W)}catch(y){u(y)}finally{x.close()}}),c.start(),r.start();const p=e.duration,m=setInterval(()=>{if(o.state==="closed"){clearInterval(m);return}const v=Math.floor(o.currentTime/p*50);s&&s(Math.min(49,v))},200);r.onended=()=>{clearInterval(m),setTimeout(()=>{c.stop()},100)}})})}function Ce(e,t,n=-16){return g(this,null,function*(){t&&t(5);const i=yield e.arrayBuffer(),s=new AudioContext,o=yield s.decodeAudioData(i);s.close(),t&&t(20);const a=J(o),r=ee(a,n);console.log(`Current: ${a.toFixed(2)} LUFS, Target: ${n}, Gain: ${r.toFixed(2)}dB`),t&&t(40);const d=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new d(o.numberOfChannels,o.length,o.sampleRate),f=c.createBufferSource();f.buffer=o;const{output:l}=te(c,f,r);l.connect(c.destination),f.start(),t&&t(60);const u=Date.now(),m=o.duration*500,v=setInterval(()=>{const x=Date.now()-u,y=Math.min(95,60+x/m*35);t&&t(Math.floor(y))},100),E=yield c.startRendering();return clearInterval(v),t&&t(100),E})}function oe(e){const t=e.numberOfChannels,n=e.length*t*2+44,i=new ArrayBuffer(n),s=new DataView(i),o=[];let a,r,d=0,c=0;for(u(1179011410),u(n-8),u(1163280727),u(544501094),u(16),l(1),l(t),u(e.sampleRate),u(e.sampleRate*2*t),l(t*2),l(16),u(1635017060),u(n-c-4),a=0;a<e.numberOfChannels;a++)o.push(e.getChannelData(a));let f=0;for(;f<e.length;){for(a=0;a<t;a++)r=Math.max(-1,Math.min(1,o[a][f])),r=(r<0?r*32768:r*32767)|0,s.setInt16(44+d,r,!0),d+=2;f++}return new Blob([i],{type:"audio/wav"});function l(p){s.setUint16(c,p,!0),c+=2}function u(p){s.setUint32(c,p,!0),c+=4}}const Ee=document.querySelector("#app");Ee.innerHTML=`
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
`;document.querySelectorAll(".tab-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active")),e.classList.add("active"),document.getElementById(e.dataset.tab).classList.add("active")})});const q=document.getElementById("statusText"),Z=document.getElementById("fileInput"),h=document.getElementById("processBtn"),I=document.getElementById("fileStatus"),Ie=document.getElementById("dropZoneText"),O=document.getElementById("previewBtn"),se=document.getElementById("previewContainer"),_=document.getElementById("eqGain"),ae=document.getElementById("eqVal");let k=null,A=null,L=null,b=null,R=!1;const U=(e,t="normal")=>{q.textContent=e,q.className=t,t==="error"?q.style.color="var(--danger-color)":t==="success"?q.style.color="var(--success-color)":q.style.color="var(--text-muted)"},H=document.getElementById("nrIntensity"),ie=document.getElementById("nrVal"),re=document.getElementById("targetLufs"),P=document.getElementById("modePreset"),K={dialogue:{eqGain:5,nrIntensity:85,description:"Optimized for voice clarity with natural sound"},gentle:{eqGain:2,nrIntensity:50,description:"Subtle noise reduction, preserves most original audio"},surgical:{eqGain:8,nrIntensity:100,description:"Maximum noise removal, may affect voice quality"}};function le(e){if(K[e]){const t=K[e];_.value=t.eqGain,ae.textContent=t.eqGain.toFixed(1),H.value=t.nrIntensity,ie.textContent=t.nrIntensity+"%"}}P.addEventListener("change",e=>{const t=e.target.value;t!=="custom"&&le(t)});_.addEventListener("input",e=>{ae.textContent=parseFloat(e.target.value).toFixed(1),P.value!=="custom"&&(P.value="custom")});H.addEventListener("input",e=>{ie.textContent=e.target.value+"%",P.value!=="custom"&&(P.value="custom")});le("dialogue");const T=document.querySelector(".file-drop-zone");["dragenter","dragover","dragleave","drop"].forEach(e=>{T.addEventListener(e,ce,!1)});function ce(e){e.preventDefault(),e.stopPropagation()}["dragenter","dragover"].forEach(e=>{T.addEventListener(e,Le,!1)});["dragleave","drop"].forEach(e=>{T.addEventListener(e,Be,!1)});function Le(e){T.classList.add("drag-over")}function Be(e){T.classList.remove("drag-over")}T.addEventListener("drop",Se,!1);function Se(e){const n=e.dataTransfer.files;Ae(n)}function Ae(e){if(e.length>0){Z.files=e;const t=new Event("change");Z.dispatchEvent(t)}}Z.addEventListener("change",e=>{e.target.files.length>0&&(k=e.target.files[0],Ie.textContent=k.name,h.disabled=!1,I.textContent="Ready to process",A=null,ue(),se.style.display="none",h.textContent="Process & Download WAV",h.onclick=de)});function de(){return g(this,null,function*(){if(k)try{h.disabled=!0,h.textContent="Processing...",U("Processing...","normal");const e=parseFloat(_.value),t=parseInt(H.value,10)/100,n=parseFloat(re.value);A=yield be(k,i=>{I.textContent=`Processing: ${i}%`},{eqDb:e,nrIntensity:t,targetLufs:n}),U("Complete","success"),I.textContent="Processing complete! You can now preview or download.",h.textContent="Download WAV",h.disabled=!1,se.style.display="flex",h.onclick=De}catch(e){console.error(e),U("Error","error"),I.textContent="Error processing file: "+e.message,h.disabled=!1}})}h.addEventListener("click",de);function De(){if(A)try{const e=oe(A),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`denoised_${k.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),I.textContent="Download started!"}catch(e){console.error("Export Error",e),I.textContent="Error exporting WAV"}}O.addEventListener("click",()=>{R?ue():Fe()});function Fe(){A&&(L=new(window.AudioContext||window.webkitAudioContext),b=L.createBufferSource(),b.buffer=A,b.connect(L.destination),b.onended=()=>{R=!1,O.textContent="Preview Result (Play)"},b.start(),R=!0,O.textContent="Stop Preview")}function ue(){if(b){try{b.stop()}catch(e){}b=null}if(L){try{L.close()}catch(e){}L=null}R=!1,O.textContent="Preview Result (Play)"}const N=document.getElementById("loudnessStatusText"),j=document.getElementById("loudnessFileInput"),w=document.getElementById("loudnessProcessBtn"),B=document.getElementById("loudnessFileStatus"),Te=document.getElementById("loudnessDropZoneText"),M=document.getElementById("loudnessPreviewBtn"),fe=document.getElementById("loudnessPreviewContainer"),D=document.getElementById("loudnessDropZone");let G=null,F=null,S=null,C=null,z=!1;const $=(e,t="normal")=>{N.textContent=e,t==="error"?N.style.color="var(--danger-color)":t==="success"?N.style.color="var(--success-color)":N.style.color="var(--text-muted)"};["dragenter","dragover","dragleave","drop"].forEach(e=>{D.addEventListener(e,ce,!1)});["dragenter","dragover"].forEach(e=>{D.addEventListener(e,()=>{D.classList.add("drag-over")},!1)});["dragleave","drop"].forEach(e=>{D.addEventListener(e,()=>{D.classList.remove("drag-over")},!1)});D.addEventListener("drop",e=>{const n=e.dataTransfer.files;if(n.length>0){j.files=n;const i=new Event("change");j.dispatchEvent(i)}},!1);j.addEventListener("change",e=>{e.target.files.length>0&&(G=e.target.files[0],Te.textContent=G.name,w.disabled=!1,B.textContent="Ready to normalize",F=null,me(),fe.style.display="none",w.textContent="Normalize & Download WAV",w.onclick=pe)});function pe(){return g(this,null,function*(){if(G)try{w.disabled=!0,w.textContent="Processing...",$("Normalizing...","normal");const e=parseFloat(re.value);F=yield Ce(G,t=>{B.textContent=`Normalizing: ${t}%`},e),$("Complete","success"),B.textContent="Normalization complete! You can now preview or download.",w.textContent="Download WAV",w.disabled=!1,fe.style.display="flex",w.onclick=qe}catch(e){console.error(e),$("Error","error"),B.textContent="Error normalizing file: "+e.message,w.disabled=!1}})}w.addEventListener("click",pe);function qe(){if(F)try{const e=oe(F),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`normalized_${G.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),B.textContent="Download started!"}catch(e){console.error("Export Error",e),B.textContent="Error exporting WAV"}}M.addEventListener("click",()=>{z?me():ke()});function ke(){F&&(S=new(window.AudioContext||window.webkitAudioContext),C=S.createBufferSource(),C.buffer=F,C.connect(S.destination),C.onended=()=>{z=!1,M.textContent="Preview Result"},C.start(),z=!0,M.textContent="Stop Preview")}function me(){if(C){try{C.stop()}catch(e){}C=null}if(S){try{S.close()}catch(e){}S=null}z=!1,M.textContent="Preview Result"}
