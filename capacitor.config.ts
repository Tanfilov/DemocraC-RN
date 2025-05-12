import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.democrac.app',
  appName: 'democra.C',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    hostname: 'app',
    iosScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
  },
  android: {
    webContentsDebuggingEnabled: false, // Disable WebView debugging for production
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
