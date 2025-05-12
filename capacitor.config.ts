import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.democrac.app',
  appName: 'democra.C',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow cleartext traffic for development
    hostname: 'app', // Use app as the hostname
    iosScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
  },
  android: {
    webContentsDebuggingEnabled: true, // Enable WebView debugging
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      signingType: undefined,
    }
  }
};

export default config;
