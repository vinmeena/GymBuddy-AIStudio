import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kinetic.gymbuddy',
  appName: 'Gym Buddy',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
