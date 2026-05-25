'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
  if (!question) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question._id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[400px]"
      >
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <span className="bg-brand-100 text-brand-800 font-bold px-4 py-1.5 rounded-full text-sm">
            Soal {question.number}
          </span>
          <span className="text-gray-400 text-sm font-medium">{question.points} Poin</span>
        </div>

        <h3 className="text-xl font-medium text-gray-800 mb-6 leading-relaxed whitespace-pre-wrap">
          {question.questionText}
        </h3>

        {question.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={question.imageUrl} alt={`Soal ${question.number}`} className="w-full max-w-2xl mx-auto h-auto object-contain" />
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
            />
          )}

          {question.type === 'multiple_response' && (
            <MultipleResponse 
              options={question.options || []}
              selectedOption={answer || ''}
              onSelect={onAnswer}
              statementsText="" // If statements are part of questionText
            />
          )}

          {question.type === 'essay' && (
            <EssayQuestion 
              value={answer || ''}
              onChange={onAnswer}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
