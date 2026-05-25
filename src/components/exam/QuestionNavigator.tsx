'use client';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: Record<string, any>; // key is question number
  onNavigate: (index: number) => void;
  onSubmit: () => void;
}

export default function QuestionNavigator({ totalQuestions, currentQuestionIndex, answers, onNavigate, onSubmit }: QuestionNavigatorProps) {
  const nums = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
      <h3 className="font-bold text-gray-800 mb-4 font-display">Navigasi Soal</h3>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {nums.map((index) => {
          const num = index + 1;
          const isAnswered = answers[num] !== undefined && answers[num] !== null && answers[num] !== '';
          // Custom check for matching type (object not empty)
          const isMatchingAnswered = typeof answers[num] === 'object' && Object.keys(answers[num]).length > 0;
          
          const finalAnswered = isAnswered || isMatchingAnswered;
          const isCurrent = currentQuestionIndex === index;

          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all
                ${isCurrent ? 'ring-2 ring-brand-500 ring-offset-2' : ''}
                ${finalAnswered 
                  ? 'bg-exam-answered text-white hover:bg-green-600' 
                  : 'bg-exam-unanswered text-gray-600 hover:bg-gray-300'
                }
              `}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
        <div className="flex space-x-4 text-xs text-gray-500">
          <div className="flex items-center"><div className="w-3 h-3 bg-exam-answered rounded-full mr-2"></div> Sudah Dijawab</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-exam-unanswered rounded-full mr-2"></div> Belum Dijawab</div>
        </div>
        <button
          onClick={onSubmit}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md shadow-brand-500/20"
        >
          Selesai & Kirim
        </button>
      </div>
    </div>
  );
}
