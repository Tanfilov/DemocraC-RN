package com.democrac.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Get WebView and optimize settings for news app
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        
        // Disable cache to ensure fresh content
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        
        // Enable DOM storage for better app state persistence
        settings.setDomStorageEnabled(true);
        
        // Allow mixed content for development
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Enable remote debugging
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
