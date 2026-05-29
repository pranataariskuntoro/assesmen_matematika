'use client';

import { useState, useEffect, useRef } from 'react';

export function useAutoSave(sessionId: string, submissionId: string | null) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveAnswer = async (questionId: string, answer: any) => {
    if (!submissionId) return;
    setStatus('saving');
    try {
      const res = await fetch('/api/exam/answer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, submissionId, questionId, answer }),
      });
      if (res.ok) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const debouncedSave = (questionId: string, answer: any) => {
    if (!submissionId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('saving');
    timeoutRef.current = setTimeout(() => {
      saveAnswer(questionId, answer);
    }, 1500);
  };

  return { debouncedSave, status };
}
