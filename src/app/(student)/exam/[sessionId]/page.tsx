'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAutoSave } from '@/hooks/useAutoSave';
import TimerBar from '@/components/exam/TimerBar';
import ProgressBar from '@/components/exam/ProgressBar';
import QuestionNavigator from '@/components/exam/QuestionNavigator';
import QuestionCard from '@/components/exam/QuestionCard';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExamSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState<any>(null);

  const { debouncedSave, status: saveStatus } = useAutoSave(sessionId as string);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch('/api/exam/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        
        if (data.redirect) {
          router.replace(data.redirect);
          return;
        }

        if (data.success) {
          setQuestions(data.questions);
          setExamData(data);
          
          // Map existing answers
          const ansMap: Record<string, any> = {};
          if (data.existingAnswers) {
            data.existingAnswers.forEach((a: any) => {
              ansMap[a.questionNumber] = a.studentAnswer;
            });
          }
          setAnswers(ansMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [sessionId, router]);

  const handleAnswer = (val: any) => {
    const currentQ = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQ.number]: val }));
    debouncedSave(currentQ._id, val);
  };

  const submitExam = async (forceSubmit = false) => {
    if (!forceSubmit) {
      const confirmed = window.confirm("Apakah kamu yakin ingin mengirim semua jawaban? Kamu tidak bisa kembali setelah ini.");
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, forceSubmit }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace('/result');
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-600 font-bold">Memuat Ujian...</div>;
  if (!questions.length) return <div className="min-h-screen flex items-center justify-center">Soal tidak ditemukan.</div>;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[k];
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return val !== undefined && val !== null && val !== '';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold font-display">
              31
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-gray-900 font-display">Asesmen SMKN 31</h1>
              <p className="text-xs text-gray-500">Ujian Aktif</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium flex items-center">
              {saveStatus === 'saving' && <span className="text-amber-500">Menyimpan...</span>}
              {saveStatus === 'saved' && <span className="text-green-500 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Tersimpan</span>}
              {saveStatus === 'error' && <span className="text-red-500">Gagal menyimpan</span>}
            </div>
            {examData?.startTime && (
              <TimerBar 
                durationMinutes={examData.duration} 
                startTime={examData.startTime} 
                onTimeUp={() => submitExam(true)} 
              />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Utama Soal */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="mb-6">
            <ProgressBar total={questions.length} answered={answeredCount} />
          </div>

          <div className="flex-1">
            <QuestionCard 
              question={currentQ} 
              answer={answers[currentQ.number]} 
              onAnswer={handleAnswer} 
            />
          </div>

          {/* Tombol Prev/Next */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Sebelumnya
            </button>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all shadow-sm shadow-brand-500/20"
            >
              Selanjutnya <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Kolom Sidebar Navigator */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <QuestionNavigator 
              totalQuestions={questions.length}
              currentQuestionIndex={currentIndex}
              answers={answers}
              onNavigate={(index) => setCurrentIndex(index)}
              onSubmit={() => submitExam(false)}
            />
          </div>
        </div>
      </main>

      {submitting && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-brand-600 font-bold text-xl flex items-center">
            <div className="w-6 h-6 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            Mengirim Jawaban...
          </div>
        </div>
      )}
    </div>
  );
}
