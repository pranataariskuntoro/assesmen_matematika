'use client';

import { motion } from 'framer-motion';

interface Option {
  key: string;
  text: string;
}

interface MultipleChoiceProps {
  options: Option[];
  selectedOption: string;
  onSelect: (key: string) => void;
}

export default function MultipleChoice({ options, selectedOption, onSelect }: MultipleChoiceProps) {
  return (
    <div className="space-y-4 mt-6">
      {options.map((opt, idx) => (
        <motion.label
          key={opt.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedOption === opt.key
              ? 'border-brand-600 bg-brand-50'
              : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center h-5">
            <input
              type="radio"
              name="multiple-choice"
              value={opt.key}
              checked={selectedOption === opt.key}
              onChange={() => onSelect(opt.key)}
              className="w-5 h-5 text-brand-600 border-gray-300 focus:ring-brand-600 mt-0.5 cursor-pointer"
            />
          </div>
          <div className="ml-4 flex-1">
            <span className="font-bold text-gray-700 mr-2">{opt.key}.</span>
            <span className="text-gray-800 leading-relaxed">{opt.text}</span>
          </div>
        </motion.label>
      ))}
    </div>
  );
}
