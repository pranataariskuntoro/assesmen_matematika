import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Ruler,
  Compass,
  DraftingCompass,
  Cone,
  Cylinder,
  BookOpen,
  FileText,
  HelpCircle,
  Cuboid,
} from 'lucide-react';
import MatchingQuestion from './MatchingQuestion';
import MultipleChoice from './MultipleChoice';
import MultipleResponse from './MultipleResponse';
import EssayQuestion from './EssayQuestion';

interface QuestionCardProps {
  question: any;
  answer: any;
  onAnswer: (val: any) => void;
}

export default function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  const OrnamentIcon = useMemo(() => {
    if (!question) return HelpCircle;
    const icons = [Calculator, Ruler, Cuboid, Compass, DraftingCompass, Cone, Cylinder, BookOpen, FileText];
    return icons[question.number % icons.length] || HelpCircle;
  }, [question]);

  if (!question) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question._id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8 min-h-[350px] relative overflow-hidden"
      >
        {/* Subtle Background Ornament inside the Card */}
        <div className="absolute right-4 bottom-4 pointer-events-none select-none z-0 opacity-[0.02] text-slate-800">
          <OrnamentIcon className="w-36 h-36 md:w-44 md:h-44 transform rotate-12" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <span className="bg-brand-100 text-brand-800 font-bold px-4 py-1.5 rounded-full text-sm">
              Soal {question.number}
            </span>
            <span className="text-gray-400 text-sm font-medium">{question.points} Poin</span>
          </div>

          {question.questionText && (
            <div className="text-xl font-medium text-gray-805 mb-6 leading-relaxed whitespace-pre-wrap">
              {question.questionText.split(/(\/image\/[^\s\n]+\.(?:png|jpg|jpeg|gif))/gi).map((part: string, idx: number) => {
                if (part.startsWith('/') && /\.(?:png|jpg|jpeg|gif)$/i.test(part)) {
                  return (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 my-4 max-w-md bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={part} alt="Gambar Soal" className="w-full mx-auto h-auto object-contain" />
                    </div>
                  );
                }
                return <span key={idx}>{part}</span>;
              })}
            </div>
          )}

          {question.imageUrl && (
            <div className={`rounded-xl overflow-hidden ${question.questionText ? 'mb-6 border border-gray-200' : 'mb-6'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={question.imageUrl} alt={`Soal ${question.number}`} className="w-full mx-auto h-auto object-contain" />
            </div>
          )}

          <div className="mt-8">
            {question.type === 'matching' && (
              <MatchingQuestion
                statements={question.matchingPairs || []}
                options={question.matchingOptions || []}
                selectedAnswers={answer || {}}
                onSelect={onAnswer}
              />
            )}

            {question.type === 'multiple_choice' && (
              <MultipleChoice
                options={question.options || []}
                selectedOption={answer || ''}
                onSelect={onAnswer}
                name={`q-${question.number}`}
              />
            )}

            {question.type === 'multiple_response' && (
              <MultipleResponse
                options={question.options || []}
                selectedOption={answer || ''}
                onSelect={onAnswer}
                statementsText="" // If statements are part of questionText
                name={`q-${question.number}`}
              />
            )}

            {question.type === 'essay' && (
              <EssayQuestion
                value={answer || ''}
                onChange={onAnswer}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
