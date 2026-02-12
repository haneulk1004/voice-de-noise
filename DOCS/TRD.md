기술 개요
Voice De-noise Web App은 Web Audio API와 스펙트럴 기반 노이즈 감소 라이브러리를 사용해 실시간 오디오 처리를 구현합니다. iZotope RX Voice De-noise의 적응형 Threshold/Reduction 기능을 JavaScript로 재현하며, 구형 Mac(High Sierra) 최적화.
​

아키텍처
클라이언트 사이드 단일 페이지 앱(PWA). 서버리스 구조로 배포 용이.

text
User Input (Mic/File) → Web Audio Context → Noise Processor → Output (Speaker/Download)
├── ScriptProcessorNode (fallback)
├── noise-repellent.js (core DSP)
└── Canvas (visualizer)
모듈화: core/audio.js, ui/controls.js, viz/spectrum.js.
​

핵심 기술 스택
컴포넌트	기술	이유
오디오 처리	Web Audio API v2 + ScriptProcessorNode	High Sierra 호환, 44.1kHz 실시간 
​
노이즈 알고리즘	noise-repellent.js (Emscripten WASM/JS)	스펙트럴 게이트/서브트랙션, N_ADAPTIVE 모드
입력/출력	getUserMedia, OfflineAudioContext	마이크/파일 업로드, 35ms 지연
UI	Vanilla JS + Canvas/WebGL	가볍고, 60FPS 스펙트럼 (512 FFT)
빌드/배포	Vite + PWA manifest	ES5 출력, GitHub Pages 호스팅
상세 구현
노이즈 제거 엔진
noise-repellent.js 초기화:

js
const nr = await NoiseRepellent.NoiseRepellent(sampleRate);
nr.set(NoiseRepellent.N_ADAPTIVE, 1);     // RX Adaptive 모드 [file:2]
nr.set(NoiseRepellent.WHITENING, 25);     // 고주파 노이즈
nr.set(NoiseRepellent.N_SUPPRESS, 20);    // Reduction dB
nr.set(NoiseRepellent.N_GATE, -30);       // Threshold
ScriptProcessorNode에서 nr.run(inputBuffer) 호출. Dialogue 모드: suppress=15dB.

파라미터 매핑 (RX 복제)
RX 파라미터	JS 구현	범위
Threshold	N_GATE	-60 ~ 0 dB
Reduction	N_SUPPRESS	0 ~ 40 dB
Mode (Dialogue)	N_ADAPTIVE=1 + preset	Optimize for Dialogue
Filter Type (Gentle)	WHITENING=15	Gentle/Surgical
파일 처리
OfflineAudioContext로 배치 처리:

js
const offline = new OfflineAudioContext(1, duration * sampleRate, sampleRate);
decodeAudioData(file).then(buffer => {
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(noiseNode).connect(offline.destination);
  return offline.startRendering();
}).then(renderedBuffer => exportWAV(renderedBuffer));
시각화
AnalyserNode로 입력/출력 비교 그래프. Log-scale (100Hz~10kHz), RX 그래프 유사.
​

성능 최적화
구형 Mac: ScriptProcessor 4096 buffer (CPU 20% 이하), WASM 대신 asm.js 폴백.

메모리: 50MB 한정, GC 트리거 방지.

지연: 20~50ms (blockSize 최적화).

호환 테스트: High Sierra Chrome 109 (최신 ESR).
​

빌드 및 배포
text
npm init vite@latest -- vanilla
npm i noise-repellent-m.js  # 또는 CDN
vite build --target es2015  # ES5 호환
PWA: serviceWorker.js로 오프라인 캐시. 호스팅: Netlify/GitHub Pages (HTTPS 필수).
​

테스트 계획
단위: Jest로 DSP 함수 (SNR 15dB 향상 검증).

E2E: Cypress로 UI/오디오 플로우.

성능: Lighthouse 90+ 점수, MacBook 2017 벤치.

이 TRD를 따라 구현 시 RX 수준 품질 달성 가능합니다.