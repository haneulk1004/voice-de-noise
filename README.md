# 🎙️ Voice De-noise

**Voice De-noise**는 웹 브라우저 기반의 실시간 음성 노이즈 제거 애플리케이션입니다.
**Web Audio API**와 **WASM**을 활용하여 서버로 데이터를 전송하지 않고, 사용자의 기기(로컬)에서 안전하고 빠르게 노이즈를 처리합니다.

## ✨ 주요 기능

*   **파일 기반 노이즈 제거**: 오디오 파일을 업로드하여 배경 소음(에어컨 소리, 팬 소음 등)이 제거된 깨끗한 WAV 파일로 변환 및 다운로드할 수 있습니다.
*   **조절 가능한 노이즈 감소**: 0-100% 강도 조절로 원본 사운드와 자연스럽게 믹스할 수 있습니다.
*   **Loudness 노멀라이제이션**: 방송(-24 LUFS), 팟캐스트(-16 LUFS), 스트리밍(-14 LUFS) 표준에 맞춰 자동으로 음량을 조정합니다.
*   **고주파 강조 (Clarity)**: 5kHz High-shelf EQ로 음성의 명료도를 향상시킵니다.
*   **True Peak 리미터**: 출력 신호가 0dBFS를 넘지 않도록 자동으로 제한합니다.
*   **멀티 플랫폼 지원**:
    *   **웹 (PWA)**: 설치 없이 브라우저에서 바로 사용 가능하며, 오프라인에서도 작동합니다.
    *   **데스크탑 (Windows)**: Electron을 통해 `.exe` 설치 파일로 빌드하여 네이티브 앱처럼 사용할 수 있습니다.

## 🚀 설치 및 실행 방법

이 프로젝트는 [Node.js](https://nodejs.org/) 환경이 필요합니다.

### 1. 프로젝트 설정
```bash
git clone https://github.com/haneulk1004/voice-de-noise.git
cd voice-de-noise
npm install
```

### 2. 웹 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.

### 3. 윈도우 데스크탑 앱 빌드 (.exe)
```bash
npm run dist:exe
```
빌드가 완료되면 **`dist-electron`** 폴더 안에 `Voice De-noise Setup 0.0.0.exe` 파일이 생성됩니다.

## 🛠️ 기술 스택

*   **Core**: HTML5, CSS3, Vanilla JavaScript
*   **Build Tool**: Vite
*   **Audio Engine**:
    *   Web Audio API (AudioWorklet, OfflineAudioContext, DynamicsCompressor)
    *   [@sapphi-red/web-noise-suppressor](https://github.com/sapphi-red/web-noise-suppressor) (Speex DSP WASM)
*   **Desktop**: Electron, Electron Builder
*   **PWA**: vite-plugin-pwa (Workbox Service Worker)
*   **Hosting**: GitHub Pages / Netlify

## 📄 라이선스

MIT License
