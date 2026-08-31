/**
 * 현재 접속 환경을 판별하는 유틸리티 함수들
 *
 * 감지 전략 (두 가지 병행):
 *  1. window.isNativeApp — Capacitor 앱에서 WebView 초기화 시 JS 변수 주입
 *  2. User-Agent         — Capacitor 앱의 커스텀 UA에 'FormulaPyramidApp' 포함
 */

/** 네이티브 앱(Capacitor WebView)에서 접속 중인지 여부 */
export function isNativeApp(): boolean {
  if (
    typeof window !== "undefined" &&
    (window as Window & { isNativeApp?: boolean }).isNativeApp === true
  ) {
    return true;
  }
  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent.includes("FormulaPyramidApp")
  ) {
    return true;
  }
  return false;
}

/** 토스인앱 브라우저에서 접속 중인지 여부 */
export function isTossInApp(): boolean {
  // 네이티브 앱이면 토스인앱이 아님
  if (isNativeApp()) return false;
  return (
    typeof navigator !== "undefined" && navigator.userAgent.includes("TossApp")
  );
}
