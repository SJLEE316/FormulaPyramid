# FormulaPyramid — 원스토어 앱 출시 대응 계획

## 개요

현재 토스인앱 전용으로 개발된 React 웹앱을 **Capacitor**를 통해 AOS/iOS 네이티브 앱으로 래핑하고,
접속 환경(토스인앱 vs 네이티브앱)에 따라 토스 관련 기능을 분기 처리합니다.

---

## 환경 감지 전략

두 가지 방법을 **병행** 사용합니다.

| 방법                     | 설명                                                  |
| ------------------------ | ----------------------------------------------------- |
| **User-Agent**           | Capacitor 앱에서 커스텀 UA 추가 (`FormulaPyramidApp`) |
| **`window.isNativeApp`** | Capacitor 앱에서 WebView 초기화 시 JS 변수 주입       |

```
환경 판별:
  - isTossApp   → 토스인앱 UA 포함 & isNativeApp 없음
  - isNativeApp → window.isNativeApp === true 또는 UA에 'FormulaPyramidApp' 포함
```

---

## 분기 처리 요약

| 기능                                       | 토스인앱          | 네이티브 앱                            |
| ------------------------------------------ | ----------------- | -------------------------------------- |
| 광고 (loadFullScreenAd / showFullScreenAd) | ✅ 사용           | ❌ 비활성화 (부활 없이 바로 게임 종료) |
| 토스 유저 해시 (getUserKeyForGame)         | ✅ 사용           | ❌ 호출 안 함                          |
| 랭킹 자동 등록                             | ✅ 해시 기반 자동 | ❌ 사용 안 함                          |
| 랭킹 수동 등록                             | ❌ (자동 처리)    | ✅ 구글 로그인 후 등록 가능            |
| 비로그인 게임                              | ✅ 항상 가능      | ✅ 가능 (랭킹 등록만 불가)             |

---

## Open Questions

> [!NOTE]
> 아래 사항들은 이미 확정된 사항으로, 구현에 반영됩니다.
>
> - 앱 환경 광고: 일단 없이 출시
> - 앱 환경 랭킹: 구글 로그인 후 등록 / 비로그인 시 불가
> - WebView 래핑: Capacitor 사용
> - 구글 로그인: Firebase Auth 사용

---

## Proposed Changes

### 1. 환경 감지 유틸리티 [NEW]

#### [NEW] `src/utils/environment.ts`

```ts
export function isNativeApp(): boolean {
  // window 변수 또는 User-Agent로 판별
  if (typeof window !== "undefined" && (window as any).isNativeApp === true)
    return true;
  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent.includes("FormulaPyramidApp")
  )
    return true;
  return false;
}

export function isTossInApp(): boolean {
  if (isNativeApp()) return false;
  return (
    typeof navigator !== "undefined" && navigator.userAgent.includes("TossApp")
  );
}
```

---

### 2. 토스 유저 훅 수정

#### [MODIFY] `src/hooks/useTossUser.ts`

- 네이티브 앱 환경(`isNativeApp()`)일 때는 `getUserKeyForGame()` 호출 없이 즉시 `fallback` 반환

---

### 3. 게임 화면 광고 분기

#### [MODIFY] `src/components/GameScreen.tsx`

- `isNativeApp()` 일 때:
  - `loadFullScreenAd` / `showFullScreenAd` 호출 안 함
  - 탈락 시 부활 팝업 없이 바로 `onGameEnd` 호출

---

### 4. Firebase Auth 구글 로그인 추가 [NEW]

#### [NEW] `src/hooks/useAppUser.ts`

```ts
// Firebase Auth 기반 Google 로그인/로그아웃
// 반환값: { user: FirebaseUser | null, signIn, signOut, loading }
```

#### [MODIFY] `src/App.tsx`

- 네이티브 앱 환경일 때 `useTossUser` 대신 `useAppUser` 사용
- `userHash` 대신 `uid` + `displayName` 기반으로 랭킹 등록 처리

---

### 5. 랭킹 화면 — 앱 환경 분기

#### [MODIFY] `src/components/RankingScreen.tsx`

| 상황                     | 처리                             |
| ------------------------ | -------------------------------- |
| 토스인앱 + userHash 있음 | 기존대로 자동 등록               |
| 앱 + 구글 로그인 완료    | uid 기반 자동 등록               |
| 앱 + 비로그인            | "로그인하고 랭킹 등록" 버튼 표시 |

---

### 6. Capacitor 세팅 [NEW]

#### 추가할 파일 및 설정

- `capacitor.config.ts` 생성
- `package.json`에 `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` 추가
- `android/`, `ios/` 폴더 생성 (Capacitor CLI가 자동 생성)
- Android WebView 커스텀 UA 설정: `FormulaPyramidApp`
- iOS WKWebView 커스텀 UA 설정: `FormulaPyramidApp`
- `window.isNativeApp = true` JS 주입 설정

> [!IMPORTANT]
> Capacitor 관련 Android/iOS 네이티브 코드 수정은 별도 작업입니다.
> **이번 PR에서는 React 웹 코드의 분기 처리만** 완료한 후,
> Capacitor 세팅은 이어서 진행합니다.

---

## Verification Plan

### Automated

- TypeScript 빌드 통과 확인 (`tsc --noEmit`)

### Manual

- **토스인앱 접속 시**: 광고 로드, 유저 해시 정상 동작 확인
- **일반 브라우저 접속 시 (앱 시뮬레이션)**: `window.isNativeApp = true` 콘솔 주입 후
  - 광고 코드 미호출 확인
  - 구글 로그인 버튼 표시 확인
  - 비로그인 상태에서 랭킹 등록 불가 확인

---

## 작업 순서

1. `src/utils/environment.ts` 생성
2. `useTossUser.ts` 수정
3. `GameScreen.tsx` 광고 분기
4. `useAppUser.ts` (Firebase Auth 구글 로그인) 생성
5. `App.tsx` 수정
6. `RankingScreen.tsx` 수정
7. 빌드/타입 확인
8. Capacitor 세팅 (별도 진행)
