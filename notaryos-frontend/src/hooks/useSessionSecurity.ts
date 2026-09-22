import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút
const WARNING_BEFORE_MS = 60 * 1000; // Cảnh báo trước 1 phút

interface UseSessionSecurityOptions {
  isLoggedIn: boolean;
  onLogout: () => void;
  onWarning?: (secondsLeft: number) => void;
}

export function useSessionSecurity({ isLoggedIn, onLogout, onWarning }: UseSessionSecurityOptions) {
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  const resetTimers = useCallback(() => {
    if (!isLoggedIn) return;
    clearTimers();

    // Timer cảnh báo (trước 1 phút)
    warningTimerRef.current = setTimeout(() => {
      onWarning?.(60);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Timer logout
    inactivityTimerRef.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [isLoggedIn, onLogout, onWarning, clearTimers]);

  // Lắng nghe các sự kiện hoạt động của người dùng
  useEffect(() => {
    if (!isLoggedIn) {
      clearTimers();
      return;
    }

    const ACTIVITY_EVENTS = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => resetTimers();

    ACTIVITY_EVENTS.forEach((event) =>
      document.addEventListener(event, handleActivity, { passive: true })
    );

    // Bắt đầu timer ngay khi login
    resetTimers();

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        document.removeEventListener(event, handleActivity)
      );
      clearTimers();
    };
  }, [isLoggedIn, resetTimers, clearTimers]);

  // Giữ trạng thái tab active
  useEffect(() => {
    if (!isLoggedIn) return;

    // Đánh dấu tab đang active trong session
    sessionStorage.setItem('tab_active', '1');

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('tab_active', '0');
      } else {
        sessionStorage.setItem('tab_active', '1');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn]);
}
