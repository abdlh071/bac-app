
import WebApp from '@twa-dev/sdk';
import { TelegramUser } from '../types/telegram';

export const initTelegram = () => {
  WebApp.ready();
  return WebApp;
};

export const expandTelegramApp = () => {
  if (!WebApp.isExpanded) {
    WebApp.expand();
    console.log('Telegram WebApp expanded to fullscreen');
  } else {
    console.log('Telegram WebApp already expanded');
  }
};

export const setupUserInteractionExpand = () => {
  let expanded = false;
  
  const expandOnInteraction = () => {
    if (!expanded && !WebApp.isExpanded) {
      expandTelegramApp();
      expanded = true;
      // Remove listeners after first expansion
      document.removeEventListener('click', expandOnInteraction);
      document.removeEventListener('touchstart', expandOnInteraction);
      document.removeEventListener('scroll', expandOnInteraction);
    }
  };

  // Add multiple event listeners to ensure expansion happens on user interaction
  document.addEventListener('click', expandOnInteraction, { once: true });
  document.addEventListener('touchstart', expandOnInteraction, { once: true });
  document.addEventListener('scroll', expandOnInteraction, { once: true });
};

export const getTelegramUser = (): TelegramUser | null => {
  const user = WebApp.initDataUnsafe?.user;
  if (!user) return null;
  
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url,
    is_premium: user.is_premium
  };
};

export const closeTelegramApp = () => {
  WebApp.close();
};

export const openTelegramLink = (url: string) => {
  WebApp.openTelegramLink(url);
};

export const showAlert = (message: string) => {
  WebApp.showAlert(message);
};
