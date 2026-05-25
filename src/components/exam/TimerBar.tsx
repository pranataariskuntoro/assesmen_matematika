'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimerBarProps {
  durationMinutes: number;
  startTime: string | Date;
  onTimeUp: () => void;
}

export default function TimerBar({ durationMinutes, startTime, onTimeUp }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const end = start + durationMinutes * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((end - now) / 1000);
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        onTimeUp();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes, startTime, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft < 600 && timeLeft >= 300; // < 10 mins
  const isDanger = timeLeft < 300; // < 5 mins

  return (
    <motion.div 
      animate={isDanger ? { scale: [1, 1.05, 1] } : {}}
      transition={isDanger ? { repeat: Infinity, duration: 1 } : {}}
      className={`flex items-center px-4 py-2 rounded-full shadow-sm border-2 ${
        isDanger 
          ? 'bg-red-50 border-red-500 text-red-700' 
          : isWarning 
            ? 'bg-amber-50 border-amber-500 text-amber-700' 
            : 'bg-white border-gray-200 text-gray-700'
      }`}
    >
      <Clock className={`w-5 h-5 mr-2 ${isDanger ? 'animate-pulse' : ''}`} />
      <span className="font-display font-bold text-lg tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </motion.div>
  );
}
