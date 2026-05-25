'use client';

export default function ProgressBar({ total, answered }: { total: number, answered: number }) {
  const percentage = Math.round((answered / total) * 100) || 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 font-bold mb-2">
        <span>Progres Pengerjaan</span>
        <span>{answered} dari {total} Soal ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-brand-500 to-exam-answered h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
