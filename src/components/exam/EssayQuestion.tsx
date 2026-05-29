'use client';

import { useState } from 'react';

interface EssayQuestionProps {
  value: string;
  onChange: (val: string) => void;
}

export default function EssayQuestion({ value, onChange }: EssayQuestionProps) {
  return (
    <div className="mt-4 space-y-2">
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ketik jawaban langkah pengerjaan dan hasil akhir Anda secara lengkap di sini..."
        className="w-full h-48 p-4 bg-slate-50/40 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-slate-800 transition-all duration-200 text-sm leading-relaxed shadow-inner placeholder:text-slate-450 resize-y"
      />
      <div className="flex justify-end">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200/50">
          {value?.length || 0} karakter
        </span>
      </div>
    </div>
  );
}
