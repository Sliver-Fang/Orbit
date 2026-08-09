import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const isNative = () => {
  return Capacitor.isNativePlatform();
};

export const initStatusBar = async () => {
  if (isNative()) {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f172a' }); // Deep slate background
    } catch (e) {
      console.warn('Native status bar styling failed:', e);
    }
  }
};

export const hideSplashScreen = async () => {
  if (isNative()) {
    try {
      await SplashScreen.hide();
    } catch (e) {
      console.warn('Splash screen hide failed:', e);
    }
  }
};

export const shareContent = async (title: string, text: string, url?: string) => {
  if (isNative()) {
    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share your progress!',
      });
      return true;
    } catch (e) {
      console.warn('Capacitor native share failed, falling back:', e);
    }
  }
  
  // Fallback to standard Web Share API
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (e) {
      console.warn('Web share API failed, falling back:', e);
    }
  }
  
  // Clipboard copy fallback
  try {
    const fullText = `${title}\n${text}${url ? '\n' + url : ''}`;
    await navigator.clipboard.writeText(fullText);
    return 'copied';
  } catch (err) {
    console.error('Clipboard copy fallback failed:', err);
    return false;
  }
};

export const scheduleLocalNotification = async (title: string, body: string, delaySeconds: number = 0.5) => {
  if (isNative()) {
    try {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') {
          console.warn('Local Notifications permission denied by user');
          return false;
        }
      }
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          }
        ]
      });
      return true;
    } catch (e) {
      console.warn('Capacitor local notification failed, falling back:', e);
    }
  }
  
  // Fallback to Web Browser Notification API
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
      return true;
    } else if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
          return true;
        }
      } catch (err) {
        console.warn('Web Notification permission request failed:', err);
      }
    }
  }
  return false;
};
