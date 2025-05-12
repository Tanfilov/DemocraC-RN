package com.democrac.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.CookieManager;
import android.util.Log;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebResourceError;
import java.util.HashMap;
import java.util.Map;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "democraC";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.i(TAG, "Starting MainActivity with enhanced WebView settings");
        
        // Get WebView and optimize settings for news app
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        
        // ====== CACHE SETTINGS ======
        
        // Disable all types of caching
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setAppCacheEnabled(false);
        
        // Clear existing cache
        webView.clearCache(true);
        webView.clearHistory();
        
        // Disable content URLs caching
        settings.setDatabaseEnabled(false);
        
        // Manage cookies - disable persistence
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(false);
        cookieManager.setAcceptThirdPartyCookies(webView, false);
        cookieManager.removeAllCookies(null);
        cookieManager.flush();
        
        // ====== PERFORMANCE SETTINGS ======
        
        // Enable DOM storage for better app state persistence
        settings.setDomStorageEnabled(true);
        
        // Allow JavaScript & DOM storage
        settings.setJavaScriptEnabled(true);
        settings.setDatabaseEnabled(true);
        
        // Network settings
        settings.setBlockNetworkImage(false);
        settings.setBlockNetworkLoads(false);
        
        // Allow mixed content for development
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Enable remote debugging
        WebView.setWebContentsDebuggingEnabled(true);
        
        // ====== CUSTOM WEB VIEW CLIENT ======
        
        // Set a custom WebViewClient to monitor requests and inject headers
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Log.e(TAG, "WebView error: " + error.toString() + " for URL: " + request.getUrl());
                super.onReceivedError(view, request, error);
            }
            
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                Log.e(TAG, "SSL Error: " + error.toString());
                handler.proceed(); // Allow SSL errors in development
            }
            
            // Add no-cache headers to outgoing requests
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                // Log API requests
                if (url.contains("/api/")) {
                    Log.i(TAG, "API Request: " + url);
                    
                    // Add timestamp to API URLs to prevent caching
                    if (!url.contains("_t=")) {
                        String separator = url.contains("?") ? "&" : "?";
                        url = url + separator + "_t=" + System.currentTimeMillis();
                        Log.i(TAG, "Modified URL with timestamp: " + url);
                    }
                }
                
                return super.shouldInterceptRequest(view, request);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.i(TAG, "Page loaded: " + url);
                
                // Inject script to force refresh when app becomes active
                String refreshScript = 
                    "function democracForceRefresh() {" +
                    "  console.log('🔄 App refresh triggered from native code');" +
                    "  if (window.handleManualRefresh) {" +
                    "    window.handleManualRefresh();" +
                    "  } else {" +
                    "    location.reload();" +
                    "  }" +
                    "}" +
                    "window.democracForceRefresh = democracForceRefresh;";
                
                view.evaluateJavascript(refreshScript, null);
            }
        });
        
        Log.i(TAG, "WebView configuration complete");
    }
}
