'use client';

import { useState } from 'react';

interface EssayQuestionProps {
  value: string;
  onChange: (val: string) => void;
}

export default function EssayQuestion({ value, onChange }: EssayQuestionProps) {
  return (
    <div className="mt-6 space-y-2">
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ketik jawaban lengkapmu di sini..."
        className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all text-gray-800 resize-y"
      />
      <div className="flex justify-end text-sm text-gray-500">
        {value?.length || 0} karakter
      </div>
    </div>
  );
}
