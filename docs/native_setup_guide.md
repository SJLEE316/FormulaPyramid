# 네이티브 앱 환경 감지 — 네이티브 설정 가이드

Capacitor로 `android/`, `ios/` 폴더가 생성된 후, 아래 코드를 각 플랫폼에 추가해야 합니다.

> [!IMPORTANT]
> `npx cap add android` / `npx cap add ios` 로 플랫폼을 추가한 뒤 진행하세요.

---

## Android — `MainActivity.java`

파일 경로: `android/app/src/main/java/com/formulapyramid/app/MainActivity.java`

실제 구현된 파일 내용:

```java
package com.formulapyramid.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();

        // 1. 커스텀 User-Agent 설정 (환경 감지용)
        String defaultUa = webView.getSettings().getUserAgentString();
        webView.getSettings().setUserAgentString(defaultUa + " FormulaPyramidApp");

        // 2. window.isNativeApp = true 주입
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.evaluateJavascript("window.isNativeApp = true;", null);
            }
        });
    }
}
```

---

## iOS — `FormulaPyramidViewController.swift`

파일 경로: `ios/App/App/FormulaPyramidViewController.swift`

실제 구현된 파일 내용:

```swift
import UIKit
import Capacitor
import WebKit

/// FormulaPyramid 전용 BridgeViewController
/// - window.isNativeApp = true 주입
/// - User-Agent에 "FormulaPyramidApp" 접미사 추가
class FormulaPyramidViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        // 1. window.isNativeApp = true 를 페이지 로드 시작 시 주입
        let script = WKUserScript(
            source: "window.isNativeApp = true;",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        configuration.userContentController.addUserScript(script)

        let webView = WKWebView(frame: frame, configuration: configuration)

        // 2. 커스텀 User-Agent 설정 (기존 UA + "FormulaPyramidApp")
        webView.evaluateJavaScript("navigator.userAgent") { [weak webView] result, _ in
            if let ua = result as? String {
                webView?.customUserAgent = ua + " FormulaPyramidApp"
            }
        }

        return webView
    }
}
```

`SceneDelegate.swift`에서 `CAPBridgeViewController` 대신 `FormulaPyramidViewController` 사용:

```swift
window?.rootViewController = FormulaPyramidViewController()  // 커스텀 UA + isNativeApp 주입
```

---

## 검증 방법

앱 실행 후 개발자 도구(Chrome Remote Debugging 또는 Safari Web Inspector)에서:

```js
// 둘 다 true여야 함
console.log(window.isNativeApp); // true
console.log(navigator.userAgent); // ... FormulaPyramidApp 포함
```

---

## Capacitor 빌드 명령어 요약

```bash
# 1. 웹 앱 빌드
npm run build

# 2. Capacitor에 빌드 결과물 동기화
npx cap sync

# 3. Android Studio로 열기
npx cap open android

# 4. Xcode로 열기 (Mac 필요)
npx cap open ios
```

---

## Firebase Console 설정 (필수)

1. [Firebase Console](https://console.firebase.google.com) → 프로젝트 선택
2. **Authentication** → **Sign-in method** → **Google** 활성화
3. **Android 앱 추가**: 패키지명 `com.formulapyramid.app`, SHA-1 인증서 등록
4. **iOS 앱 추가**: 번들 ID `com.formulapyramid.app`
