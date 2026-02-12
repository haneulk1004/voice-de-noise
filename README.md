# 🎙️ Voice De-noise

**Voice De-noise**는 웹 브라우저 기반의 실시간 음성 노이즈 제거 애플리케이션입니다.
**Web Audio API**와 **WASM**을 활용하여 서버로 데이터를 전송하지 않고, 사용자의 기기(로컬)에서 안전하고 빠르게 노이즈를 처리합니다.

## ✨ 주요 기능

*   **실시간 노이즈 제거**: 마이크 입력에서 배경 소음(에어컨 소리, 팬 소음 등)을 즉시 제거합니다.
*   **파일 처리**: 오디오 파일을 업로드하여 노이즈가 제거된 깨끗한 WAV 파일로 변환 및 다운로드할 수 있습니다.
*   **오디오 시각화**: 입력과 출력 오디오의 스펙트럼을 실시간으로 시각화하여 노이즈 제거 효과를 눈으로 확인할 수 있습니다.
*   **멀티 플랫폼 지원**:
    *   **웹 (PWA)**: 설치 없이 브라우저에서 바로 사용 가능합니다.
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
*   **Audio Engine**: Web Audio API, [@sapphi-red/web-noise-suppressor](https://github.com/sapphi-red/web-noise-suppressor) (WASM)
*   **Desktop**: Electron, Electron Builder
*   **Hosting**: GitHub Pages / Netlify

## 📄 라이선스

MIT License
