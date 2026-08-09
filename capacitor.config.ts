import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studytracker.app',
  appName: 'Study & Productivity Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
