import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aojewelry.app',
  appName: 'AO Jewelry',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  }
};

export default config;
