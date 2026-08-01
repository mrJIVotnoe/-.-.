// ========================================================
// TELEGRAM WEB APP SDK HELPERS & UTILITIES
// Enables seamless Telegram Mini App execution in JIV Fleet
// ========================================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isVersionAtLeast?: (version: string) => boolean;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

/**
 * Safely retrieve the Telegram WebApp instance if running inside Telegram
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

/**
 * Check if the app is currently running inside Telegram Mini App container
 */
export function isTelegramMiniApp(): boolean {
  const tg = getTelegramWebApp();
  return Boolean(tg && tg.initData && tg.initData.length > 0);
}

/**
 * Initialize Telegram WebApp settings (ready, expand, theme colors)
 */
export function initTelegramEnvironment(): void {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
    } catch {
      // Ignore if not supported
    }
    
    try {
      tg.expand();
    } catch {
      // Ignore if not supported
    }
    
    // Set Header & Background colors matching JIV Fleet dark theme (Telegram WebApp 6.1+ only)
    try {
      const supportsColorApi = tg.isVersionAtLeast ? tg.isVersionAtLeast('6.1') : false;
      if (supportsColorApi) {
        if (typeof tg.setHeaderColor === 'function') {
          tg.setHeaderColor('#020617'); // slate-950
        }
        if (typeof tg.setBackgroundColor === 'function') {
          tg.setBackgroundColor('#020617');
        }
      }
    } catch {
      // Ignore if unsupported in older Telegram clients
    }
  }
}

/**
 * Trigger haptic feedback vibration in Telegram
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): void {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;

  if (type === 'success' || type === 'warning' || type === 'error') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}

/**
 * Get current Telegram User details if available
 */
export function getTelegramUser(): TelegramUser | null {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
}

/**
 * Get deep link parameter (e.g., t.me/bot/app?startapp=param)
 */
export function getTelegramStartParam(): string | null {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.start_param || null;
}
