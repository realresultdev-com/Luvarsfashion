package com.buddymattress.app;

import android.app.Dialog;
import android.os.Bundle;
import android.os.Message;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Intent;
import android.net.Uri;
import androidx.browser.customtabs.CustomTabsIntent;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    private Dialog activePopupDialog = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Professional MNC GPU hardware acceleration
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );
    }

    @Override
    public void onStart() {
        super.onStart();
        configureWebViewSettings();
    }

    @Override
    public void onBackPressed() {
        // If an OAuth popup or dialog is visible, dismiss it first
        if (activePopupDialog != null && activePopupDialog.isShowing()) {
            activePopupDialog.dismiss();
            activePopupDialog = null;
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    private void configureWebViewSettings() {
        if (bridge == null || bridge.getWebView() == null) return;

        WebView webView = bridge.getWebView();
        WebSettings settings = webView.getSettings();

        // 1. Enable HTML5 video & media playback without requiring user gesture (like Instagram)
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 2. Strip WebView markers ("; wv" and "Version/X.X") from User-Agent to prevent Google OAuth 403 disallowed_useragent
        String defaultUA = settings.getUserAgentString();
        final String cleanUA = defaultUA.replace("; wv", "").replaceAll("Version\\/\\d+\\.\\d+\\s*", "");
        settings.setUserAgentString(cleanUA);

        // 3. Multi-window / popup window support
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        // 4. Accept cookies for Google Auth sessions
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // 5. Tier-1 MNC native caching and mixed content policy
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        // 6. Setup BridgeWebChromeClient override: Route any popup / window.open to Chrome Custom Tabs
        // This ensures the user's real device Google accounts are available instead of an isolated incognito WebView!
        webView.setWebChromeClient(new BridgeWebChromeClient(bridge) {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView tempWebView = new WebView(MainActivity.this);
                tempWebView.getSettings().setUserAgentString(cleanUA);
                tempWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                        String targetUrl = request.getUrl() != null ? request.getUrl().toString() : "";
                        if (!targetUrl.isEmpty()) {
                            try {
                                CustomTabsIntent customTabsIntent = new CustomTabsIntent.Builder().build();
                                customTabsIntent.launchUrl(MainActivity.this, Uri.parse(targetUrl));
                                return true;
                            } catch (Exception e) {
                                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl));
                                startActivity(intent);
                                return true;
                            }
                        }
                        return false;
                    }
                });

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(tempWebView);
                resultMsg.sendToTarget();
                return true;
            }
        });
    }
}
