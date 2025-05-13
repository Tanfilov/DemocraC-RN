import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, BackHandler, ToastAndroid, Image, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

// Main screen with WebView
const WebViewScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);
  const [backButtonPressedOnce, setBackButtonPressedOnce] = useState(false);

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
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          
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

  // Inject custom JavaScript to handle mobile-specific features
  const injectedJavaScript = `
    window.isNativeApp = true;
    window.isAndroidApp = true;
    
    // Disable caching for API calls
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (!options) options = {};
        if (!options.headers) options.headers = {};
        
        // Add cache-busting query parameter for API calls
        if (url.includes('/api/')) {
          const separator = url.includes('?') ? '&' : '?';
          url = url + separator + 'nocache=' + Date.now();
        }
        
        // Add no-cache headers
        options.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        options.headers['Pragma'] = 'no-cache';
        options.headers['Expires'] = '0';
        
        return originalFetch(url, options);
      };
    }
    
    // Log that we're running in the mobile app
    console.log('Running in React Native WebView');
    
    true; // This is needed for injectedJavaScript to work
  `;

  return (
    <View style={styles.container}>
      {isLoading && <SplashScreen />}
      
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
        incognito={true} // This prevents using cookies/cache
        thirdPartyCookiesEnabled={false}
        // Handle errors by showing a simple error page
        renderError={(errorName) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorText}>
              Unable to connect to democra.C. Please check your internet connection and try again.
            </Text>
            <Text style={styles.errorDetails}>{errorName}</Text>
          </View>
        )}
      />
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
});