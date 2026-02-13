var w=(t,e,n)=>new Promise((s,o)=>{var i=c=>{try{r(n.next(c))}catch(u){o(u)}},a=c=>{try{r(n.throw(c))}catch(u){o(u)}},r=c=>c.done?s(c.value):Promise.resolve(c.value).then(i,a);r((n=n.apply(t,e)).next())});(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();var K="@sapphi-red/web-noise-suppressor/speex",X=class extends AudioWorkletNode{constructor(t,{maxChannels:e,wasmBinary:n}){const s={processorOptions:{maxChannels:e,wasmBinary:n}};super(t,K,s)}destroy(){this.port.postMessage("destroy")}};const k="/voice-de-noise/assets/workletProcessor-_AMzdT6B.js",Y="/voice-de-noise/assets/speex-BeXkxj2B.wasm";class W{constructor(){this.ctx=null,this.node=null,this.eqNode=null,this.source=null,this.destination=null,this.wasmBinary=null}init(e){return w(this,null,function*(){this.ctx=e;try{if(!this.wasmBinary){const n=yield fetch(Y);this.wasmBinary=yield n.arrayBuffer()}return yield this.ctx.audioWorklet.addModule(k),this.node=new X(this.ctx,{wasmBinary:this.wasmBinary,maxChannels:1}),this.eqNode=this.ctx.createBiquadFilter(),this.eqNode.type="highshelf",this.eqNode.frequency.value=5e3,this.eqNode.gain.value=0,this.node.connect(this.eqNode),this.dryGain=this.ctx.createGain(),this.wetGain=this.ctx.createGain(),this.dryGain.gain.value=0,this.wetGain.gain.value=1,console.log("NoiseSuppressor initialized"),this.node}catch(n){throw console.error("Failed to initialize NoiseSuppressor:",n),n}})}connect(e,n){if(!this.node)throw new Error("NoiseSuppressor not initialized");this.source=e,this.destination=n,e.connect(this.dryGain),this.dryGain.connect(n),e.connect(this.node),this.eqNode.connect(this.wetGain),this.wetGain.connect(n)}disconnect(){this.node&&(this.node.disconnect(),this.eqNode.disconnect(),this.dryGain.disconnect(),this.wetGain.disconnect())}setBypass(e){this.setIntensity(e?0:1)}setIntensity(e){if(!this.dryGain||!this.wetGain)return;const n=Math.max(0,Math.min(1,e)),s=1-n;this.dryGain.gain.setTargetAtTime(s,this.ctx.currentTime,.1),this.wetGain.gain.setTargetAtTime(n,this.ctx.currentTime,.1)}setEQ(e){this.eqNode&&this.eqNode.gain.setTargetAtTime(e,this.ctx.currentTime,.1)}setParams(e){console.log("Params updated:",e)}}function J(t){const e=t.getChannelData(0);let n=0;for(let a=0;a<e.length;a++)n+=e[a]*e[a];const s=Math.sqrt(n/e.length);return s===0?-100:20*Math.log10(s)-.691}function ee(t,e){let n=e-t;return n>20&&(n=20),n<-20&&(n=-20),n}function te(t){const e=t.createDynamicsCompressor();return e.threshold.value=-1,e.knee.value=0,e.ratio.value=20,e.attack.value=.001,e.release.value=.1,e}function ne(t,e,n){const s=t.createGain(),o=te(t),i=Math.pow(10,n/20);return s.gain.value=i,e.connect(s),s.connect(o),{input:s,output:o}}function ie(s,o){return w(this,arguments,function*(t,e,n={}){let i=5,a=1,r=-24;typeof n=="number"?i=n:typeof n=="object"&&(n.eqDb!==void 0&&(i=n.eqDb),n.nrIntensity!==void 0&&(a=n.nrIntensity),n.targetLufs!==void 0&&(r=n.targetLufs));const c=yield t.arrayBuffer(),f=yield new AudioContext().decodeAudioData(c),l=window.OfflineAudioContext||window.webkitOfflineAudioContext,d=new l(f.numberOfChannels,f.length,f.sampleRate);if(!d.audioWorklet)return console.warn("OfflineAudioContext missing audioWorklet. Switching to Real-time Fallback."),P(f,a,i,r,e);try{yield d.audioWorklet.addModule(k)}catch(F){return console.warn("Failed to add worklet to OfflineCtx. Switching to Real-time Fallback.",F),P(f,a,i,r,e)}const p=d.createBufferSource();p.buffer=f;const h=new W;yield h.init(d),h.connect(p,d.destination),h.setIntensity(a),h.setEQ(i),p.start(),e&&e(10);const v=d.startRendering(),b=f.duration*1e3,g=Date.now(),G=setInterval(()=>{const F=Date.now()-g,_=Math.min(45,10+F/b*35);e&&e(Math.floor(_))},100),H=yield v;return clearInterval(G),e&&e(50),V(H,r,e,50,100)})}function V(t,e,n,s,o){return w(this,null,function*(){const i=J(t),a=ee(i,e);console.log(`Loudness: ${i.toFixed(2)} LUFS, Target: ${e}, Gain: ${a.toFixed(2)}dB`);const r=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new r(t.numberOfChannels,t.length,t.sampleRate),u=c.createBufferSource();u.buffer=t;const{output:f}=ne(c,u,a);f.connect(c.destination),u.start();const l=c.startRendering(),d=Date.now(),h=t.duration*500,v=setInterval(()=>{const b=Date.now()-d,g=Math.min(o-1,s+b/h*(o-s));n&&n(Math.floor(g))},100),q=yield l;return clearInterval(v),n&&n(o),q})}function P(t,e,n,s,o){return w(this,null,function*(){console.log("Starting Real-time Fallback Processing...");const i=new AudioContext;let a=!0;try{yield i.audioWorklet.addModule(k)}catch(l){console.warn("AudioWorklet not supported even in Real-time. Skipping Denoise step.",l),a=!1}const r=i.createBufferSource();r.buffer=t;const c=i.createMediaStreamDestination();if(a){const l=new W;yield l.init(i),l.connect(r,c),l.setIntensity(e),l.setEQ(n)}else{const l=i.createBiquadFilter();l.type="highshelf",l.frequency.value=3e3,l.gain.value=n,r.connect(l),l.connect(c)}const u=new MediaRecorder(c.stream),f=[];return new Promise((l,d)=>{u.ondataavailable=v=>{v.data.size>0&&f.push(v.data)},u.onstop=()=>w(this,null,function*(){r.disconnect(),i.close();const q=yield new Blob(f,{type:"audio/webm"}).arrayBuffer(),b=new AudioContext;try{const g=yield b.decodeAudioData(q);o&&o(50);const G=yield V(g,s,o,50,100);l(G)}catch(g){d(g)}finally{b.close()}}),u.start(),r.start();const p=t.duration,h=setInterval(()=>{if(i.state==="closed"){clearInterval(h);return}const v=Math.floor(i.currentTime/p*50);o&&o(Math.min(49,v))},200);r.onended=()=>{clearInterval(h),setTimeout(()=>{u.stop()},100)}})})}function oe(t){const e=t.numberOfChannels,n=t.length*e*2+44,s=new ArrayBuffer(n),o=new DataView(s),i=[];let a,r,c=0,u=0;for(d(1179011410),d(n-8),d(1163280727),d(544501094),d(16),l(1),l(e),d(t.sampleRate),d(t.sampleRate*2*e),l(e*2),l(16),d(1635017060),d(n-u-4),a=0;a<t.numberOfChannels;a++)i.push(t.getChannelData(a));let f=0;for(;f<t.length;){for(a=0;a<e;a++)r=Math.max(-1,Math.min(1,i[a][f])),r=(r<0?r*32768:r*32767)|0,o.setInt16(44+c,r,!0),c+=2;f++}return new Blob([s],{type:"audio/wav"});function l(p){o.setUint16(u,p,!0),u+=2}function d(p){o.setUint32(u,p,!0),u+=4}}const ae=document.querySelector("#app");ae.innerHTML=`
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
  </div>

  <!-- Tab: Settings -->
  <div id="tab-settings" class="tab-content">
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

          <div class="control-group">
            <label for="targetLufs">Loudness Target</label>
            <select id="targetLufs">
                <option value="-24">Broadcast (-24 LUFS)</option>
                <option value="-16" selected>Mobile / Podcast (-16 LUFS)</option>
                <option value="-14">Online / Streaming (-14 LUFS)</option>
            </select>
          </div>
        </div>
      </div>
  </div>
`;document.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(e=>e.classList.remove("active")),t.classList.add("active"),document.getElementById(t.dataset.tab).classList.add("active")})});const E=document.getElementById("statusText"),M=document.getElementById("fileInput"),m=document.getElementById("processBtn"),x=document.getElementById("fileStatus"),se=document.getElementById("dropZoneText"),A=document.getElementById("previewBtn"),U=document.getElementById("previewContainer"),O=document.getElementById("eqGain"),z=document.getElementById("eqVal");let L=null,I=null,C=null,y=null,D=!1;const T=(t,e="normal")=>{E.textContent=t,E.className=e,e==="error"?E.style.color="var(--danger-color)":e==="success"?E.style.color="var(--success-color)":E.style.color="var(--text-muted)"},N=document.getElementById("nrIntensity"),$=document.getElementById("nrVal"),re=document.getElementById("targetLufs"),B=document.getElementById("modePreset"),R={dialogue:{eqGain:5,nrIntensity:85,description:"Optimized for voice clarity with natural sound"},gentle:{eqGain:2,nrIntensity:50,description:"Subtle noise reduction, preserves most original audio"},surgical:{eqGain:8,nrIntensity:100,description:"Maximum noise removal, may affect voice quality"}};function j(t){if(R[t]){const e=R[t];O.value=e.eqGain,z.textContent=e.eqGain.toFixed(1),N.value=e.nrIntensity,$.textContent=e.nrIntensity+"%"}}B.addEventListener("change",t=>{const e=t.target.value;e!=="custom"&&j(e)});O.addEventListener("input",t=>{z.textContent=parseFloat(t.target.value).toFixed(1),B.value!=="custom"&&(B.value="custom")});N.addEventListener("input",t=>{$.textContent=t.target.value+"%",B.value!=="custom"&&(B.value="custom")});j("dialogue");const S=document.querySelector(".file-drop-zone");["dragenter","dragover","dragleave","drop"].forEach(t=>{S.addEventListener(t,le,!1)});function le(t){t.preventDefault(),t.stopPropagation()}["dragenter","dragover"].forEach(t=>{S.addEventListener(t,ce,!1)});["dragleave","drop"].forEach(t=>{S.addEventListener(t,de,!1)});function ce(t){S.classList.add("drag-over")}function de(t){S.classList.remove("drag-over")}S.addEventListener("drop",ue,!1);function ue(t){const n=t.dataTransfer.files;fe(n)}function fe(t){if(t.length>0){M.files=t;const e=new Event("change");M.dispatchEvent(e)}}M.addEventListener("change",t=>{t.target.files.length>0&&(L=t.target.files[0],se.textContent=L.name,m.disabled=!1,x.textContent="Ready to process",I=null,Q(),U.style.display="none",m.textContent="Process & Download WAV",m.onclick=Z)});function Z(){return w(this,null,function*(){if(L)try{m.disabled=!0,m.textContent="Processing...",T("Processing...","normal");const t=parseFloat(O.value),e=parseInt(N.value,10)/100,n=parseFloat(re.value);I=yield ie(L,s=>{x.textContent=`Processing: ${s}%`},{eqDb:t,nrIntensity:e,targetLufs:n}),T("Complete","success"),x.textContent="Processing complete! You can now preview or download.",m.textContent="Download WAV",m.disabled=!1,U.style.display="flex",m.onclick=pe}catch(t){console.error(t),T("Error","error"),x.textContent="Error processing file: "+t.message,m.disabled=!1}})}m.addEventListener("click",Z);function pe(){if(I)try{const t=oe(I),e=URL.createObjectURL(t),n=document.createElement("a");n.href=e,n.download=`denoised_${L.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),x.textContent="Download started!"}catch(t){console.error("Export Error",t),x.textContent="Error exporting WAV"}}A.addEventListener("click",()=>{D?Q():me()});function me(){I&&(C=new(window.AudioContext||window.webkitAudioContext),y=C.createBufferSource(),y.buffer=I,y.connect(C.destination),y.onended=()=>{D=!1,A.textContent="Preview Result (Play)"},y.start(),D=!0,A.textContent="Stop Preview")}function Q(){if(y){try{y.stop()}catch(t){}y=null}if(C){try{C.close()}catch(t){}C=null}D=!1,A.textContent="Preview Result (Play)"}
