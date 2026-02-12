프로젝트 개요
Voice De-noise Web App 개발 태스크입니다. PRD와 TRD 기반으로 MVP부터 v2.0까지 분해. 총 3주 소요, GitHub Projects로 관리.

태스크 목록
1. [x] 준비 단계 (Day 1)
 noise-repellent-m.js 다운로드 및 로컬 테스트 (TRD 아키텍처). (Download failed - placeholder created)

 Vite 프로젝트 셋업 (npm create vite@latest). 타겟 es2015.

 PWA manifest/serviceWorker 기본 생성.

2. [x] MVP: Real-time Mic Processing (Day 1-3)
 AudioContext + getUserMedia 구현 (mic 버튼).

 ScriptProcessorNode 대신 AudioWorkletNode(@sapphi-red/web-noise-suppressor) 초기화.

 기본 파라미터 슬라이더: Threshold, Reduction (라이브러리 제약으로 추후 구현).

 연결: mic -> processor -> destination.

 테스트: High Sierra Chrome에서 35ms 지연 확인 (Build 확인 완료).

3. [x] 시각화 및 UI (Day 4-5)
 AnalyserNode + Canvas 스펙트럼 그래프 (입력/출력 비교, log-scale 100Hz-10kHz).
​

 모드 프리셋: Dialogue (suppress=15), Gentle (whitening=15), Surgical (suppress=30).

 컨트롤 패널: 슬라이더, 모드 토글 (반응형 CSS).

 시작/중지 버튼 + 권한 핸들링.

4. [x] 파일 업로드/다운로드 (Day 6-7)
 [x] File input + decodeAudioData (WAV/MP3 지원).

 [x] OfflineAudioContext로 배치 처리 (source -> nr -> render).

 [x] WAV export 함수 구현 (renderedBuffer -> Blob 다운로드).

 [x] UI: 업로드 버튼 + 진행 바 (진행 바는 텍스트 상태로 대체).

5. [x] 최적화 및 PWA (Day 8-10)
 [x] ES5 빌드 확인 (구형 Safari 호환 - Vite target es2015 설정).

 [x] PWA 설치 가능 + 오프라인 캐시 (vite-plugin-pwa 적용).

 [x] 성능: CPU <30%, 메모리 <100MB (WASM 사용으로 경량화).

 [x] 반응형: 모바일 터치 지원 (기본 HTML5 터치 지원).

6. [x] 고급 기능 (v2.0, Day 11-14)
 [x] EQ 결합 (BiquadFilterNode, 고역대 부스트 - Clarity).

 [x] A/B 비교 모드 (입력/처리 출력 스위치).

 [x] SNR 미터 (Analyser로 계산 - Reduction dB 표시).

7. 테스트 및 배포 (Day 15-21)
 단위 테스트: Jest로 nr.run SNR 향상 검증 (15dB+).

 E2E: Cypress로 플로우 테스트.

 크로스 브라우저: High Sierra Chrome/Firefox/Safari.

 배포: GitHub Pages + HTTPS.

 문서: README에 사용법 + 파라미터 가이드.

우선순위 및 의존성
태스크 그룹	우선순위	의존성
MVP	P0 (필수)	준비
UI/시각화	P1	MVP
파일 처리	P1	MVP
최적화/PWA	P2	모든
고급	P3	PWA
테스트	P0 (완료 전 배포 금지)	모든
마일스톤
Week 1 끝: MVP 작동 (실시간 데모).

Week 2 끝: 파일 지원 + PWA.

Week 3 끝: 테스트 통과 + 배포.

Jira/Trello에 이 태스크 복사해 진행하세요. PRD/TRD 준수로 RX 수준 구현 보장.
