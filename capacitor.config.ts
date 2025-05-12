import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.democrac.app',
  appName: 'democra.C',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'app',
    iosScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
  },
  android: {
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
