import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.formulapyramid.app",
  appName: "수식 피라미드",
  webDir: "dist/web",
  // 번들된 웹 앱을 WebView에서 로드
  server: {
    // 개발 시 로컬 서버 연결 (프로덕션 빌드 시에는 주석 처리)
    // Vercel 배포 URL 주소를 지정합니다.
    url: 'https://formula-pyramid-eta.vercel.app/',
    cleartext: true
  },
  android: {
    // 네이티브 앱 감지용 커스텀 User-Agent 접미사 추가
    // Android WebView는 네이티브에서 설정 필요 (MainActivity.kt 참고)
  },
  ios: {
    // 네이티브 앱 감지용 커스텀 User-Agent 접미사 추가
    // iOS WKWebView는 네이티브에서 설정 필요 (AppDelegate.swift 참고)
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
  },
};

export default config;
