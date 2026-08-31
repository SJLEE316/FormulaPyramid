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

    override func instanceDescriptor() -> InstanceDescriptor {
        let descriptor = super.instanceDescriptor()
        return descriptor
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

