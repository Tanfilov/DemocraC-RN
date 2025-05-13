import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, BackHandler, ToastAndroid, Image, Text, AppState, RefreshControl, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enhancedWebViewScript, webViewMethods } from './WebViewIntegration';

// The URL of your democra.C web application - this assumes it's hosted somewhere
// You'll need to update this to your actual hosted URL
const WEB_APP_URL = 'https://democrac.repl.co/';

// Splash screen to show while the WebView loads
const SplashScreen = () => {
  return (
    <View style={styles.splash}>
      {/* Here we'll use the democra.C logo */}
      <Image 
        source={require('./assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>democra.C</Text>
      <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
    </View>
  );
};

// Offline error screen
const OfflineScreen = ({ onRetry }) => {
  return (
    <View style={styles.errorContainer}>
      <Image 
        source={require('./assets/logo.png')} 
        style={styles.smallLogo}
        resizeMode="contain" 
      />
      <Text style={styles.errorTitle}>אין חיבור לאינטרנט</Text>
      <Text style={styles.errorText}>
        אנא בדקו את החיבור לאינטרנט שלכם ונסו שוב
      </Text>
      <View style={styles.retryButton} onTouchEnd={onRetry}>
        <Text style={styles.retryButtonText}>נסה שנית</Text>
      </View>
    </View>
  );
};

// Main screen with WebView
const WebViewScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const webViewRef = useRef(null);
  const [backButtonPressedOnce, setBackButtonPressedOnce] = useState(false);
  const appState = useRef(AppState.currentState);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App has come to the foreground!');
        webViewMethods.refreshContent(webViewRef);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle connection errors
  const handleError = () => {
    setIsOffline(true);
    setIsLoading(false);
  };

  // Retry connection
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setIsOffline(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        // Check if WebView can go back
        webViewRef.current.injectJavaScript(`
          (function() {
            if (window.location.pathname !== '/' && window.location.pathname !== '') {
              window.history.back();
              return true;
            }
            return false;
          })()
        `).then((canGoBack) => {
          if (canGoBack) {
            return true; // Prevent default behavior
          }
          
          // Exit app behavior with double tap
          if (backButtonPressedOnce) {
            BackHandler.exitApp();
            return true;
          }
          
          setBackButtonPressedOnce(true);
          ToastAndroid.show('לחץ שוב ליציאה', ToastAndroid.SHORT);
          
          // Reset back button pressed state after 2 seconds
          setTimeout(() => {
            setBackButtonPressedOnce(false);
          }, 2000);
          
          return true; // Prevent default behavior
        });
      }
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [backButtonPressedOnce]);

  // Handle pull-to-refresh
  const handlePullToRefresh = useCallback(() => {
    webViewMethods.refreshContent(webViewRef);
  }, []);

  return (
    <View style={styles.container}>
      {isLoading && <SplashScreen />}
      {isOffline ? (
        <OfflineScreen onRetry={handleRetry} />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: WEB_APP_URL }}
          style={styles.webview}
          injectedJavaScript={enhancedWebViewScript}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          incognito={true} // This prevents using cookies/cache
          thirdPartyCookiesEnabled={false}
          pullToRefreshEnabled={true}
          onRefresh={handlePullToRefresh}
          applicationNameForUserAgent="democraC-AndroidApp"
          textZoom={100}
          sharedCookiesEnabled={false}
          // Handle errors by showing a simple error page
          renderError={(errorName) => (
            <OfflineScreen onRetry={handleRetry} />
          )}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="WebView"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="WebView" component={WebViewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  smallLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});