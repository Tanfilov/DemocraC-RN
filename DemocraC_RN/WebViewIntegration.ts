/**
 * WebView Integration Helper
 * 
 * This file contains utility functions and JavaScript code injections
 * to enhance the integration between the WebView and the native app.
 */

// Inject this JavaScript into the WebView to improve the experience
export const enhancedWebViewScript = `
// Set flags to indicate we're in a mobile app
window.isNativeApp = true;
window.isAndroidApp = true;
window.isMobileView = true;

// Force RTL for Hebrew support
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

// Add RTL styles for the app
const rtlStyles = document.createElement('style');
rtlStyles.innerHTML = `
  body {
    direction: rtl;
    text-align: right;
  }
  
  /* Ensure RTL for elements that may have inline styles */
  .rtl-force {
    direction: rtl !important;
    text-align: right !important;
  }
`;
document.head.appendChild(rtlStyles);

// Disable caching for all API calls and handle JSON parsing errors
if (window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (!options) options = {};
    if (!options.headers) options.headers = {};
    
    // Add cache-busting for API calls and redirect to WebView-specific endpoints
    if (typeof url === 'string' && url.includes('/api/')) {
      // Replace standard news endpoint with WebView-specific endpoint
      if (url.includes('/api/news')) {
        url = '/api/webview/news';
      }
      
      // Add cache busting parameters
      const separator = url.includes('?') ? '&' : '?';
      url = url + separator + 'nocache=' + Date.now() + '&mobile=true&webview=true';
    }
    
    // Add no-cache headers
    options.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    options.headers['Pragma'] = 'no-cache';
    options.headers['Expires'] = '0';
    
    // Add accepts header to ensure we get JSON
    options.headers['Accept'] = 'application/json';
    
    // Return a promise that handles HTML response errors
    return originalFetch(url, options).then(response => {
      // Clone the response so we can check the content type
      const contentType = response.headers.get('content-type');
      
      // If it's not JSON but we expected JSON, handle the error
      if (url.includes('/api/') && (!contentType || !contentType.includes('application/json'))) {
        // Create a custom error response with helpful message
        return response.text().then(text => {
          console.error('Received HTML instead of JSON:', text.substring(0, 100) + '...');
          
          // Return a fake response with error message
          const errorData = {
            error: true,
            message: 'שגיאת שרת: התקבל HTML במקום JSON. בדוק את הכתובת או נסה שוב מאוחר יותר.',
            items: []
          };
          
          const blob = new Blob([JSON.stringify(errorData)], {type: 'application/json'});
          const init = { status: 200, statusText: 'OK' };
          return new Response(blob, init);
        });
      }
      
      return response;
    }).catch(error => {
      console.error('Fetch error:', error);
      
      // Create a custom error response
      const errorData = {
        error: true,
        message: 'שגיאת תקשורת: ' + error.message,
        items: []
      };
      
      const blob = new Blob([JSON.stringify(errorData)], {type: 'application/json'});
      const init = { status: 500, statusText: 'Network Error' };
      return new Response(blob, init);
    });
  };
}

// Add error handler for JSON.parse
(function() {
  const originalJSONParse = JSON.parse;
  JSON.parse = function(text) {
    try {
      // Safeguard against empty or null inputs
      if (!text) {
        console.warn('Attempted to parse empty or null JSON');
        return { error: true, message: 'קלט ריק', items: [] };
      }
      
      // Sanitize input to handle potential HTML responses
      if (typeof text === 'string') {
        // Check for HTML content
        if (text.includes('<!DOCTYPE') || 
            text.includes('<html') || 
            text.includes('<head') || 
            text.includes('<body')) {
          console.error('Detected HTML in JSON input, creating fallback response');
          return {
            error: true,
            message: 'התקבל HTML במקום JSON - נסה לרענן את האפליקציה',
            items: [],
            timestamp: Date.now()
          };
        }
        
        // Try to extract JSON if embedded in other content
        // This handles cases where we get JSON mixed with other text
        if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
          const jsonMatch = text.match(/({[\s\S]*}|\[[\s\S]*\])/);
          if (jsonMatch) {
            console.warn('Extracted embedded JSON from mixed content');
            text = jsonMatch[0];
          }
        }
      }
      
      // Now try to parse the (potentially sanitized) input
      return originalJSONParse(text);
    } catch (e) {
      console.error('JSON parse error:', e, 'for text type:', typeof text);
      if (typeof text === 'string') {
        console.error('Preview:', text.substring(0, 100) + '...');
      }
      
      // Return a valid but empty response instead of throwing
      if (typeof text === 'string' && (text.includes('<!DOCTYPE') || text.includes('<html'))) {
        console.error('Received HTML instead of JSON');
        return {
          error: true,
          message: 'שגיאת פענוח: התקבל HTML במקום JSON',
          items: [],
          timestamp: Date.now()
        };
      }
      
      return {
        error: true,
        message: 'שגיאת פענוח JSON: ' + e.message,
        items: [],
        timestamp: Date.now()
      };
    }
  };
})();

// Intercept XMLHttpRequest to add cache-busting
(function() {
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && url.includes('/api/')) {
      // Replace standard news endpoint with WebView-specific endpoint
      if (url.includes('/api/news')) {
        url = '/api/webview/news';
      }
      
      // Add cache busting parameters
      const separator = url.includes('?') ? '&' : '?';
      url = url + separator + 'nocache=' + Date.now() + '&mobile=true&webview=true';
    }
    return originalOpen.call(this, method, url, ...rest);
  };
})();

// Improve scrolling performance
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.innerHTML = \`
    * {
      -webkit-overflow-scrolling: touch;
    }
    body {
      overscroll-behavior-y: none;
      touch-action: pan-y;
    }
  \`;
  document.head.appendChild(style);
});

// Add media query for mobile optimizations
(function() {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(meta);
})();

// Refresh content automatically when app returns to foreground
window.addEventListener('focus', function() {
  // Check if there's a refresh function available
  if (typeof window.manualRefresh === 'function') {
    window.manualRefresh();
  } else if (typeof window.refreshNews === 'function') {
    window.refreshNews();
  }
});

// Listen for messages from the React Native side
window.addEventListener('message', function(event) {
  try {
    const message = JSON.parse(event.data);
    
    // Handle refresh requests
    if (message.type === 'refresh') {
      if (typeof window.manualRefresh === 'function') {
        window.manualRefresh();
      } else if (typeof window.refreshNews === 'function') {
        window.refreshNews();
      }
    }
  } catch (e) {
    console.error('Error processing message from app:', e);
  }
});

// Detect network status changes
window.addEventListener('online', function() {
  console.log('Connection restored, refreshing...');
  if (typeof window.manualRefresh === 'function') {
    window.manualRefresh();
  }
});

// Democra.C specific functions for news refresh
(function() {
  // Try to find the refresh functions from the app
  setTimeout(() => {
    // Define manual refresh function if it doesn't exist
    if (typeof window.manualRefresh !== 'function') {
      window.manualRefresh = function() {
        console.log('Manual refresh triggered from WebView wrapper');
        // Try to click any refresh buttons if they exist
        const refreshButtons = document.querySelectorAll('button[aria-label="refresh"]');
        if (refreshButtons && refreshButtons.length > 0) {
          refreshButtons[0].click();
          return true;
        }
        
        // Try to trigger a refresh event
        const refreshEvent = new Event('refresh');
        window.dispatchEvent(refreshEvent);
        
        // Try to reset the refreshKey if it exists
        if (window.refreshKey !== undefined && typeof window.setRefreshKey === 'function') {
          window.setRefreshKey(Date.now());
          return true;
        }
        
        // Force reload as last resort
        location.reload();
        return true;
      };
    }
    
    // Override any existing refresh function to ensure it works well in the app
    const originalRefresh = window.manualRefresh;
    window.manualRefresh = function() {
      console.log('Enhanced refresh triggered from WebView wrapper');
      
      // Add a timestamp parameter to break cache
      const timestamp = new Date().toISOString();
      window.lastRefreshTime = timestamp;
      
      // Call the original refresh
      return originalRefresh.apply(this, arguments);
    };
    
    // Refresh immediately on load
    setTimeout(() => {
      if (typeof window.manualRefresh === 'function') {
        window.manualRefresh();
      }
    }, 1000);
    
    // Set up periodic refresh for news content
    setInterval(() => {
      if (typeof window.manualRefresh === 'function') {
        window.manualRefresh();
      }
    }, 60000); // Every minute
    
  }, 1000); // Wait for app to initialize
})();

// Log to confirm the script has loaded
console.log('democra.C WebView integration initialized');

true; // Required for injectedJavaScript
`;

// Methods to expose to the React Native side
export const webViewMethods = {
  // Refresh the WebView content
  refreshContent: (webViewRef: any) => {
    if (webViewRef && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof window.manualRefresh === 'function') {
          window.manualRefresh(); 
        } else if (typeof window.refreshNews === 'function') {
          window.refreshNews();
        }
        true;
      `);
    }
  },
  
  // Clear WebView cache
  clearCache: (webViewRef: any) => {
    if (webViewRef && webViewRef.current) {
      webViewRef.current.clearCache(true);
    }
  },
  
  // Post a message to the WebView
  postMessage: (webViewRef: any, message: any) => {
    if (webViewRef && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(${JSON.stringify(JSON.stringify(message))}, '*');
        true;
      `);
    }
  }
};