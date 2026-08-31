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
