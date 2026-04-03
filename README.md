# 🔺 수식 피라미드

피라미드 칸 3개를 선택해 타겟 넘버를 만드는 수학 퍼즐 게임입니다.

## 게임 규칙

### 기본 규칙
- **10라운드** 진행
- 매 라운드마다 피라미드 칸 **10개(A~J)** 와 **타겟 넘버**가 공개됩니다
- 각 칸에는 **연산자(+, -, ×, ÷)와 숫자**가 배치됩니다
- 칸 3개를 선택해 타겟 넘버가 되는 수식을 만들어야 합니다

### 수식 계산 방식
- **첫 번째 선택 칸의 부호는 무시**되고 숫자만 사용됩니다
- **사칙연산 우선순위**(×÷ 먼저, +- 나중에)가 적용됩니다

### 피라미드 구조
```
      A
     B C
    D E F
   G H I J
```

### 점수
| 조건 | 점수 |
|------|------|
| 정답 | **+1점** |
| 오답 | **-1점** |

### 보너스 점수 (라운드 내 모든 정답을 맞춘 경우)
| 남은 시간 | 보너스 |
|-----------|--------|
| 1분 이상 | **+5점** |
| 30초 ~ 1분 | **+3점** |
| 30초 미만 | **+1점** |

### 라운드 종료 조건
- **3분** 경과
- 모든 정답 소진

### 랭킹
- 게임 종료 후 닉네임을 입력하여 온라인 랭킹에 등록할 수 있습니다
- 홈 화면에서 **랭킹 보기** 버튼으로 언제든 TOP 20 랭킹을 확인할 수 있습니다
- **토스앱** 환경에서는 `getUserKeyForGame` API로 자동 유저 식별 후 닉네임 입력 없이 랭킹 등록됩니다

## 기술 스택
- **Frontend**: React + TypeScript + Vite
- **Database**: Firebase Firestore (온라인 랭킹)
- **인앱 로그인**: `@apps-in-toss/web-framework` — `getUserKeyForGame`

## 프로젝트 구조

```
src/
├── App.tsx                   # 화면 라우팅 (home / game / ranking / ranking-page)
├── App.css                   # 전체 스타일
├── colors.css                # CSS 색상 변수
├── firebase.ts               # Firebase 초기화
├── gameLogic.ts              # 수식 생성 / 계산 / 정답 탐색
├── hooks/
│   └── useTossUser.ts        # 토스 게임 로그인 훅
└── components/
    ├── PyramidBoard.tsx       # 피라미드 칸 UI
    ├── GameScreen.tsx         # 게임 진행 화면
    ├── RankingList.tsx        # 공용 랭킹 테이블
    ├── RankingScreen.tsx      # 게임 종료 후 랭킹 등록
    └── RankingPage.tsx        # 홈에서 접근하는 랭킹 페이지
```

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

