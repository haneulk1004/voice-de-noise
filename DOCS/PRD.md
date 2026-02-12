Voice De-noise Web App은 iZotope RX Voice De-noise 기능을 웹 브라우저에서 재현하는 도구입니다. 실시간/파일 기반 오디오 노이즈 제거를 제공하며, 구형 Mac(High Sierra 이상)에서 가볍게 작동합니다.
​

타겟 사용자
팟캐스터, 유튜버 등 대화 오디오 녹음자.

구형 Mac 사용자 (2017 MacBook Pro 등 저사양).

개발자나 오디오 애호가 (커스텀 노이즈 제거 필요).

핵심 기능
실시간 노이즈 제거: 마이크 입력에서 배경 소음(팬, 공기 흐름) 자동 감소.

파일 업로드 처리: WAV/MP3 업로드 후 노이즈 제거 다운로드.

파라미터 조정: Threshold(-30dB ~ 0dB), Reduction(0 ~ 40dB), 대화/수술/일반 모드.
​

시각화: 주파수 스펙트럼 그래프 (입력/출력 비교).

오프라인 지원: PWA로 설치 가능, 인터넷 불필요.

기술 스펙
순수 클라이언트 사이드 (API 미사용):

Web Audio API + ScriptProcessorNode (AudioWorklet 폴백).

noise-repellent.js 라이브러리 (스펙트럴 서브트랙션 기반).

브라우저 호환: Chrome 55+, Firefox 52+, Safari 14+ (High Sierra 지원).

성능: 35ms 지연, 1GB RAM 이하.

사용자 여정
앱 열기 → 마이크 권한 요청.

"시작" 클릭 → 실시간 처리 + 스펙트럼 표시.

슬라이더로 Threshold/Reduction 조정 (기본: Dialogue 모드).

파일 업로드 → 처리 후 다운로드.

PWA 설치로 앱처럼 사용.

UI/UX 디자인
메인 화면: 중앙 오디오 컨트롤러, 하단 스펙트럼 그래프.

컨트롤: 모드 선택(대화/일반), Threshold 슬라이더, Reduction 슬라이더.

반응형: 모바일/데스크톱 지원, 다크 모드.

접근성: 키보드 네비, ARIA 라벨.

성공 지표
사용자 유지: 80%가 1회 사용 후 재방문.

성능: 노이즈 20dB 이상 감소 (RX 유사).

호환성: High Sierra Mac에서 60FPS 유지.
​

개발 로드맵
단계	작업	예상 기간
MVP	실시간 마이크 + 기본 파라미터	1주
v1.1	파일 업로드/다운로드 + 시각화	3일
v1.2	PWA + 모드 프리셋	2일
v2.0	고급 필터 (EQ 결합)	1주
