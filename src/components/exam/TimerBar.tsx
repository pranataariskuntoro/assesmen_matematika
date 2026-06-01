'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimerBarProps {
  durationMinutes: number;
  startTime: string | Date;
  onTimeUp: () => void;
  onTick?: (timeLeft: number) => void;
}

export default function TimerBar({ durationMinutes, startTime, onTimeUp, onTick }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const end = start + durationMinutes * 60 * 1000;

    // Set initial tick
    const nowInit = new Date().getTime();
    const diffInit = Math.floor((end - nowInit) / 1000);
    if (diffInit <= 0) {
      setTimeLeft(0);
      if (onTick) onTick(0);
      onTimeUp();
      return;
    } else {
      setTimeLeft(diffInit);
      if (onTick) onTick(diffInit);
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((end - now) / 1000);
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        if (onTick) onTick(0);
        onTimeUp();
      } else {
        setTimeLeft(diff);
        if (onTick) onTick(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes, startTime, onTimeUp, onTick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft < 600 && timeLeft >= 300; // < 10 mins
  const isDanger = timeLeft < 300; // < 5 mins

  const timerColor = isDanger
    ? 'bg-red-50 border-red-400 text-red-700'
    : isWarning
      ? 'bg-amber-50 border-amber-400 text-amber-700'
      : 'bg-white border-slate-200 text-slate-700';

  const labelColor = isDanger
    ? 'text-red-500'
    : isWarning
      ? 'text-amber-500'
      : 'text-slate-400';

  return (
    <motion.div
      animate={isDanger ? { scale: [1, 1.04, 1] } : {}}
      transition={isDanger ? { repeat: Infinity, duration: 1 } : {}}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border-2 shadow-sm ${timerColor}`}
    >
      <Clock className={`w-4 h-4 shrink-0 ${isDanger ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-base tracking-widest tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className={`text-[10px] font-semibold tracking-wide ${labelColor}`}>
          Sisa {minutes} menit
        </span>
      </div>
    </motion.div>
  );
}

