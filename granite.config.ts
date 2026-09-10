import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "formula-pyramid",
  brand: {
    displayName: "수식피라미드", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#ff6fb3", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://static.toss.im/appsintoss/84887/d3897038-a63f-485d-a0d6-7b73adba26ce.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: "172.16.11.227",
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
