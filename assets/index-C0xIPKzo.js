var x=(t,e,n)=>new Promise((r,o)=>{var s=l=>{try{i(n.next(l))}catch(c){o(c)}},a=l=>{try{i(n.throw(l))}catch(c){o(c)}},i=l=>l.done?r(l.value):Promise.resolve(l.value).then(s,a);i((n=n.apply(t,e)).next())});(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();var pe="@sapphi-red/web-noise-suppressor/speex",me=class extends AudioWorkletNode{constructor(t,{maxChannels:e,wasmBinary:n}){const r={processorOptions:{maxChannels:e,wasmBinary:n}};super(t,pe,r)}destroy(){this.port.postMessage("destroy")}};const z="/voice-de-noise/assets/workletProcessor-_AMzdT6B.js",fe="/voice-de-noise/assets/speex-BeXkxj2B.wasm";class _{constructor(){this.ctx=null,this.node=null,this.eqNode=null,this.source=null,this.destination=null,this.wasmBinary=null}init(e){return x(this,null,function*(){this.ctx=e;try{if(!this.wasmBinary){const n=yield fetch(fe);this.wasmBinary=yield n.arrayBuffer()}return yield this.ctx.audioWorklet.addModule(z),this.node=new me(this.ctx,{wasmBinary:this.wasmBinary,maxChannels:2}),this.eqNode=this.ctx.createBiquadFilter(),this.eqNode.type="highshelf",this.eqNode.frequency.value=5e3,this.eqNode.gain.value=0,this.node.connect(this.eqNode),this.dryGain=this.ctx.createGain(),this.wetGain=this.ctx.createGain(),this.dryGain.gain.value=0,this.wetGain.gain.value=1,console.log("NoiseSuppressor initialized"),this.node}catch(n){throw console.error("Failed to initialize NoiseSuppressor:",n),n}})}connect(e,n){if(!this.node)throw new Error("NoiseSuppressor not initialized");this.source=e,this.destination=n,e.connect(this.dryGain),this.dryGain.connect(n),e.connect(this.node),this.eqNode.connect(this.wetGain),this.wetGain.connect(n)}disconnect(){this.node&&(this.node.disconnect(),this.eqNode.disconnect(),this.dryGain.disconnect(),this.wetGain.disconnect())}setBypass(e){this.setIntensity(e?0:1)}setIntensity(e){if(!this.dryGain||!this.wetGain)return;const r=.8+Math.max(0,Math.min(1,e))*.2,o=1-r;this.dryGain.gain.setTargetAtTime(o,this.ctx.currentTime,.1),this.wetGain.gain.setTargetAtTime(r,this.ctx.currentTime,.1)}setEQ(e){this.eqNode&&this.eqNode.gain.setTargetAtTime(e,this.ctx.currentTime,.1)}setParams(e){console.log("Params updated:",e)}}class ve{constructor(){this.ctx=null,this.highpassFilter=null,this.noiseGate=null,this.deesser=null,this.compressor=null}init(e){this.ctx=e,this.highpassFilter=e.createBiquadFilter(),this.highpassFilter.type="highpass",this.highpassFilter.frequency.value=80,this.highpassFilter.Q.value=.7,this.noiseGate=e.createDynamicsCompressor(),this.noiseGate.threshold.value=-50,this.noiseGate.knee.value=10,this.noiseGate.ratio.value=12,this.noiseGate.attack.value=.003,this.noiseGate.release.value=.25,this.deesserFilter=e.createBiquadFilter(),this.deesserFilter.type="peaking",this.deesserFilter.frequency.value=7e3,this.deesserFilter.Q.value=2,this.deesserFilter.gain.value=-6,this.compressor=e.createDynamicsCompressor(),this.compressor.threshold.value=-24,this.compressor.knee.value=12,this.compressor.ratio.value=4,this.compressor.attack.value=.005,this.compressor.release.value=.1,console.log("VoiceEnhancer initialized")}connect(e,n){if(!this.ctx)throw new Error("VoiceEnhancer not initialized");e.connect(this.highpassFilter),this.highpassFilter.connect(this.noiseGate),this.noiseGate.connect(this.deesserFilter),this.deesserFilter.connect(this.compressor),this.compressor.connect(n)}disconnect(){this.highpassFilter&&this.highpassFilter.disconnect(),this.noiseGate&&this.noiseGate.disconnect(),this.deesserFilter&&this.deesserFilter.disconnect(),this.compressor&&this.compressor.disconnect()}setNoiseGateThreshold(e){this.noiseGate&&(this.noiseGate.threshold.value=e)}setDeesserAmount(e){if(this.deesserFilter){const n=-12*e;this.deesserFilter.gain.value=n}}setCompressionRatio(e){this.compressor&&(this.compressor.ratio.value=e)}setHighpassFrequency(e){this.highpassFilter&&(this.highpassFilter.frequency.value=e)}}function W(t){const e=t.numberOfChannels;let n=0,r=0;for(let i=0;i<e;i++){const l=t.getChannelData(i);for(let c=0;c<l.length;c++)n+=l[c]*l[c];r+=l.length}const o=Math.sqrt(n/r);return o===0?-100:20*Math.log10(o)-.7}function K(t,e){let n=e-t;return n>30&&(console.warn(`⚠️ Clamping gain from ${n.toFixed(2)}dB to +30dB to prevent excessive boost`),n=30),n<-20&&(console.warn(`⚠️ Clamping gain from ${n.toFixed(2)}dB to -20dB`),n=-20),n}function ge(t){const e=t.createDynamicsCompressor();return e.threshold.value=-.5,e.knee.value=0,e.ratio.value=20,e.attack.value=.003,e.release.value=.05,e}function X(t,e,n){const r=t.createGain(),o=ge(t),s=Math.pow(10,n/20);return r.gain.value=s,e.connect(r),r.connect(o),{input:r,output:o}}function ye(r,o){return x(this,arguments,function*(t,e,n={}){let s=5,a=1,i=-24,l=-50,c=.5,f=4;typeof n=="number"?s=n:typeof n=="object"&&(n.eqDb!==void 0&&(s=n.eqDb),n.nrIntensity!==void 0&&(a=n.nrIntensity),n.targetLufs!==void 0&&(i=n.targetLufs),n.noiseGateThreshold!==void 0&&(l=n.noiseGateThreshold),n.deesserAmount!==void 0&&(c=n.deesserAmount),n.compressionRatio!==void 0&&(f=n.compressionRatio));const d=yield t.arrayBuffer(),h=yield new AudioContext().decodeAudioData(d),b=window.OfflineAudioContext||window.webkitOfflineAudioContext,p=new b(h.numberOfChannels,h.length,h.sampleRate);if(!p.audioWorklet)return console.warn("OfflineAudioContext missing audioWorklet. Switching to Real-time Fallback."),Q(h,a,s,i,e);try{yield p.audioWorklet.addModule(z)}catch(O){return console.warn("Failed to add worklet to OfflineCtx. Switching to Real-time Fallback.",O),Q(h,a,s,i,e)}const w=p.createBufferSource();w.buffer=h;const v=new _;yield v.init(p);const m=new ve;m.init(p),m.setNoiseGateThreshold(l),m.setDeesserAmount(c),m.setCompressionRatio(f),console.log(`Processing with: Intensity=${a}, EQ=${s}dB, Channels=${h.numberOfChannels}`),console.log(`Voice Enhancement: Gate=${l}dB, De-esser=${(c*100).toFixed(0)}%, Compression=${f}:1`),v.setIntensity(a),v.setEQ(s);const C=p.createGain();v.connect(w,C),m.connect(C,p.destination),w.start(),e&&e(10);const k=p.startRendering(),ce=h.duration*1e3,de=Date.now(),ue=setInterval(()=>{const O=Date.now()-de,he=Math.min(45,10+O/ce*35);e&&e(Math.floor(he))},100),Z=yield k;clearInterval(ue);const j=W(Z);return j<-90?(console.error(`⚠️ Denoise output is silent (${j.toFixed(2)} LUFS)! Using original audio instead.`),V(h,i,e,50,100)):(e&&e(50),V(Z,i,e,50,100))})}function V(t,e,n,r,o){return x(this,null,function*(){const s=W(t),a=K(s,e);console.log(`Loudness: ${s.toFixed(2)} LUFS, Target: ${e}, Gain: ${a.toFixed(2)}dB`);const i=window.OfflineAudioContext||window.webkitOfflineAudioContext,l=new i(t.numberOfChannels,t.length,t.sampleRate),c=l.createBufferSource();c.buffer=t;const{output:f}=X(l,c,a);f.connect(l.destination),c.start();const d=l.startRendering(),u=Date.now(),b=t.duration*500,p=setInterval(()=>{const v=Date.now()-u,m=Math.min(o-1,r+v/b*(o-r));n&&n(Math.floor(m))},100),w=yield d;return clearInterval(p),n&&n(o),w})}function Q(t,e,n,r,o){return x(this,null,function*(){console.log("Starting Real-time Fallback Processing...");const s=new AudioContext;let a=!0;try{yield s.audioWorklet.addModule(z)}catch(d){console.warn("AudioWorklet not supported even in Real-time. Skipping Denoise step.",d),a=!1}const i=s.createBufferSource();i.buffer=t;const l=s.createMediaStreamDestination();if(a){const d=new _;yield d.init(s),d.connect(i,l),d.setIntensity(e),d.setEQ(n)}else{const d=s.createBiquadFilter();d.type="highshelf",d.frequency.value=3e3,d.gain.value=n,i.connect(d),d.connect(l)}const c=new MediaRecorder(l.stream),f=[];return new Promise((d,u)=>{c.ondataavailable=p=>{p.data.size>0&&f.push(p.data)},c.onstop=()=>x(this,null,function*(){i.disconnect(),s.close();const w=yield new Blob(f,{type:"audio/webm"}).arrayBuffer(),v=new AudioContext;try{const m=yield v.decodeAudioData(w);o&&o(50);const C=yield V(m,r,o,50,100);d(C)}catch(m){u(m)}finally{v.close()}}),c.start(),i.start();const h=t.duration,b=setInterval(()=>{if(s.state==="closed"){clearInterval(b);return}const p=Math.floor(s.currentTime/h*50);o&&o(Math.min(49,p))},200);i.onended=()=>{clearInterval(b),setTimeout(()=>{c.stop()},100)}})})}function we(t,e,n=-16){return x(this,null,function*(){e&&e(5);const r=yield t.arrayBuffer(),o=new AudioContext,s=yield o.decodeAudioData(r);o.close();const a=s.length,i=s.duration;console.log(`Original: ${a} samples, ${i.toFixed(2)}s, ${s.numberOfChannels}ch, ${s.sampleRate}Hz`),e&&e(20);const l=W(s),c=K(l,n);console.log(`Loudness: Current=${l.toFixed(2)} LUFS, Target=${n} LUFS, Gain=${c.toFixed(2)}dB`),e&&e(40);const f=window.OfflineAudioContext||window.webkitOfflineAudioContext,d=new f(s.numberOfChannels,s.length,s.sampleRate),u=d.createBufferSource();u.buffer=s;const{output:h}=X(d,u,c);h.connect(d.destination),u.start(),e&&e(60);const b=Date.now(),w=s.duration*500,v=setInterval(()=>{const C=Date.now()-b,k=Math.min(95,60+C/w*35);e&&e(Math.floor(k))},100),m=yield d.startRendering();return clearInterval(v),console.log(`Output: ${m.length} samples, ${m.duration.toFixed(2)}s (Original was ${a} samples, ${i.toFixed(2)}s)`),m.length!==a&&console.warn(`⚠️ Length mismatch! Output is ${(m.length/a*100).toFixed(1)}% of original`),e&&e(100),m})}function J(t){const e=t.numberOfChannels,n=t.length*e*2+44,r=new ArrayBuffer(n),o=new DataView(r),s=[];let a,i,l=0,c=0;for(u(1179011410),u(n-8),u(1163280727),u(544501094),u(16),d(1),d(e),u(t.sampleRate),u(t.sampleRate*2*e),d(e*2),d(16),u(1635017060),u(n-c-4),a=0;a<t.numberOfChannels;a++)s.push(t.getChannelData(a));let f=0;for(;f<t.length;){for(a=0;a<e;a++)i=Math.max(-1,Math.min(1,s[a][f])),i=(i<0?i*32768:i*32767)|0,o.setInt16(44+l,i,!0),l+=2;f++}return new Blob([r],{type:"audio/wav"});function d(h){o.setUint16(c,h,!0),c+=2}function u(h){o.setUint32(c,h,!0),c+=4}}const xe=document.querySelector("#app");xe.innerHTML=`
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

      <div class="card">
        <h3>Advanced Settings</h3>
        <div class="controls">
          <div class="control-group">
            <label for="noiseGateThreshold">Noise Gate</label>
            <input type="range" id="noiseGateThreshold" min="-60" max="-30" value="-50" step="1">
            <span id="gateVal">-50 dB</span>
          </div>
          <small class="hint">Lower values = more aggressive background noise removal</small>

          <div class="control-group">
            <label for="deesserAmount">De-esser (Sibilance)</label>
            <input type="range" id="deesserAmount" min="0" max="100" value="50" step="1">
            <span id="deesserVal">50%</span>
          </div>
          <small class="hint">Reduces harsh 'S' and 'SH' sounds</small>

          <div class="control-group">
            <label for="compressionRatio">Voice Leveling</label>
            <input type="range" id="compressionRatio" min="1" max="8" value="4" step="0.5">
            <span id="compVal">4:1</span>
          </div>
          <small class="hint">Balances loud and quiet parts (higher = more consistent)</small>
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
`;document.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(e=>e.classList.remove("active")),t.classList.add("active"),document.getElementById(t.dataset.tab).classList.add("active")})});const B=document.getElementById("statusText"),$=document.getElementById("fileInput"),g=document.getElementById("processBtn"),E=document.getElementById("fileStatus"),be=document.getElementById("dropZoneText"),U=document.getElementById("eqGain"),Y=document.getElementById("eqVal");let S=null,T=null;const R=(t,e="normal")=>{B.textContent=t,B.className=e,e==="error"?B.style.color="var(--danger-color)":e==="success"?B.style.color="var(--success-color)":B.style.color="var(--text-muted)"},P=document.getElementById("nrIntensity"),ee=document.getElementById("nrVal"),te=document.getElementById("targetLufs"),G=document.getElementById("modePreset"),ne=document.getElementById("noiseGateThreshold"),Ce=document.getElementById("gateVal"),se=document.getElementById("deesserAmount"),Ee=document.getElementById("deesserVal"),oe=document.getElementById("compressionRatio"),Fe=document.getElementById("compVal"),H={dialogue:{eqGain:5,nrIntensity:70,description:"Optimized for voice clarity (94% noise reduction)"},gentle:{eqGain:2,nrIntensity:50,description:"Subtle processing (90% noise reduction)"},surgical:{eqGain:8,nrIntensity:100,description:"Maximum noise removal (100% processed)"}};function ae(t){if(H[t]){const e=H[t];U.value=e.eqGain,Y.textContent=e.eqGain.toFixed(1),P.value=e.nrIntensity,ee.textContent=e.nrIntensity+"%"}}G.addEventListener("change",t=>{const e=t.target.value;e!=="custom"&&ae(e)});U.addEventListener("input",t=>{Y.textContent=parseFloat(t.target.value).toFixed(1),G.value!=="custom"&&(G.value="custom")});P.addEventListener("input",t=>{ee.textContent=t.target.value+"%",G.value!=="custom"&&(G.value="custom")});ne.addEventListener("input",t=>{Ce.textContent=t.target.value+" dB"});se.addEventListener("input",t=>{Ee.textContent=t.target.value+"%"});oe.addEventListener("input",t=>{Fe.textContent=t.target.value+":1"});ae("dialogue");const L=document.querySelector(".file-drop-zone");["dragenter","dragover","dragleave","drop"].forEach(t=>{L.addEventListener(t,ie,!1)});function ie(t){t.preventDefault(),t.stopPropagation()}["dragenter","dragover"].forEach(t=>{L.addEventListener(t,Ie,!1)});["dragleave","drop"].forEach(t=>{L.addEventListener(t,Le,!1)});function Ie(t){L.classList.add("drag-over")}function Le(t){L.classList.remove("drag-over")}L.addEventListener("drop",Be,!1);function Be(t){const n=t.dataTransfer.files;Se(n)}function Se(t){if(t.length>0){$.files=t;const e=new Event("change");$.dispatchEvent(e)}}$.addEventListener("change",t=>{t.target.files.length>0&&(S=t.target.files[0],be.textContent=S.name,g.disabled=!1,E.textContent="Ready to process",T=null,g.textContent="Process & Download WAV",g.onclick=re)});function re(){return x(this,null,function*(){if(S)try{g.disabled=!0,g.textContent="Processing...",R("Processing...","normal");const t=parseFloat(U.value),e=parseInt(P.value,10)/100,n=parseFloat(te.value),r=parseFloat(ne.value),o=parseInt(se.value,10)/100,s=parseFloat(oe.value);T=yield ye(S,a=>{E.textContent=`Processing: ${a}%`},{eqDb:t,nrIntensity:e,targetLufs:n,noiseGateThreshold:r,deesserAmount:o,compressionRatio:s}),R("Complete","success"),E.textContent="Processing complete! Click to download.",g.textContent="Download WAV",g.disabled=!1,g.onclick=Ge}catch(t){console.error(t),R("Error","error"),E.textContent="Error processing file: "+t.message,g.disabled=!1}})}g.addEventListener("click",re);function Ge(){if(T)try{const t=J(T),e=URL.createObjectURL(t),n=document.createElement("a");n.href=e,n.download=`denoised_${S.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),E.textContent="Download started!"}catch(t){console.error("Export Error",t),E.textContent="Error exporting WAV"}}const A=document.getElementById("loudnessStatusText"),M=document.getElementById("loudnessFileInput"),y=document.getElementById("loudnessProcessBtn"),F=document.getElementById("loudnessFileStatus"),De=document.getElementById("loudnessDropZoneText"),I=document.getElementById("loudnessDropZone");let D=null,q=null;const N=(t,e="normal")=>{A.textContent=t,e==="error"?A.style.color="var(--danger-color)":e==="success"?A.style.color="var(--success-color)":A.style.color="var(--text-muted)"};["dragenter","dragover","dragleave","drop"].forEach(t=>{I.addEventListener(t,ie,!1)});["dragenter","dragover"].forEach(t=>{I.addEventListener(t,()=>{I.classList.add("drag-over")},!1)});["dragleave","drop"].forEach(t=>{I.addEventListener(t,()=>{I.classList.remove("drag-over")},!1)});I.addEventListener("drop",t=>{const n=t.dataTransfer.files;if(n.length>0){M.files=n;const r=new Event("change");M.dispatchEvent(r)}},!1);M.addEventListener("change",t=>{t.target.files.length>0&&(D=t.target.files[0],De.textContent=D.name,y.disabled=!1,F.textContent="Ready to normalize",q=null,y.textContent="Normalize & Download WAV",y.onclick=le)});function le(){return x(this,null,function*(){if(D)try{y.disabled=!0,y.textContent="Processing...",N("Normalizing...","normal");const t=parseFloat(te.value);q=yield we(D,e=>{F.textContent=`Normalizing: ${e}%`},t),N("Complete","success"),F.textContent="Normalization complete! Click to download.",y.textContent="Download WAV",y.disabled=!1,y.onclick=Ae}catch(t){console.error(t),N("Error","error"),F.textContent="Error normalizing file: "+t.message,y.disabled=!1}})}y.addEventListener("click",le);function Ae(){if(q)try{const t=J(q),e=URL.createObjectURL(t),n=document.createElement("a");n.href=e,n.download=`normalized_${D.name.replace(/\.[^/.]+$/,"")}.wav`,document.body.appendChild(n),n.click(),document.body.removeChild(n),F.textContent="Download started!"}catch(t){console.error("Export Error",t),F.textContent="Error exporting WAV"}}
