'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AntiCheatConfig {
  maxViolations: number;
  onWarning: (count: number, remaining: number) => void;
  onTerminate: () => void;
  sessionId: string;
}

export function useAntiCheat({ maxViolations = 3, onWarning, onTerminate, sessionId }: AntiCheatConfig) {
  const [violationCount, setViolationCount] = useState(0);
  const isTerminated = useRef(false);

  useEffect(() => {
    if (isTerminated.current) return;

    const handleViolation = async (type: string) => {
      if (isTerminated.current) return;

      const newCount = violationCount + 1;
      setViolationCount(newCount);

      try {
        const res = await fetch('/api/exam/violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, type, count: newCount }),
        });
        const data = await res.json();
        
        if (data.terminated) {
          isTerminated.current = true;
          onTerminate();
        } else {
          onWarning(data.violationCount, data.remaining);
        }
      } catch (error) {
        console.error('Failed to log violation:', error);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) handleViolation('tab_switch');
    };

    const onBlur = () => {
      handleViolation('window_blur');
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation('right_click');
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy_paste');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopy);

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopy);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [violationCount, sessionId, onWarning, onTerminate]);

  return { violationCount };
}
