'use client';

import { PenLine } from 'lucide-react';

interface EssayQuestionProps {
  value?: string;
  onChange?: (val: string) => void;
}

export default function EssayQuestion({ }: EssayQuestionProps) {
  return (
    <div className="mt-4">
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <PenLine className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-800 mb-0.5">Jawab di Kertas</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Tuliskan jawaban dan langkah pengerjaan soal ini pada <strong>lembar jawaban kertas</strong> yang telah disediakan.
          </p>
        </div>
      </div>
    </div>
  );
}
