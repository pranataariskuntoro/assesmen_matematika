'use client';

import { motion } from 'framer-motion';

interface Option {
  key: string;         // display label (A–E in shuffled order)
  text: string;
  originalKey?: string; // original key from DB (set by shuffleOptions utility)
}

interface MultipleChoiceProps {
  options: Option[];
  /** The currently stored answer – always the originalKey from DB */
  selectedOption: string;
  onSelect: (originalKey: string) => void;
  name: string;
}

export default function MultipleChoice({ options, selectedOption, onSelect, name }: MultipleChoiceProps) {
  return (
    <div className="space-y-3.5 mt-5">
      {options.map((opt, idx) => {
        // The key we store in state / DB is always the original key
        const storedKey = opt.originalKey ?? opt.key;
        const isSelected = selectedOption === storedKey;

        return (
          <motion.label
            key={opt.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group relative ${
              isSelected
                ? 'border-brand-600 bg-brand-50/40 shadow-sm shadow-brand-500/5'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center h-6">
              <input
                type="radio"
                name={name}
                value={storedKey}
                checked={isSelected}
                onChange={() => onSelect(storedKey)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'border-brand-600 bg-brand-600 scale-105 shadow-md shadow-brand-500/10' 
                  : 'border-slate-300 bg-white group-hover:border-slate-400'
              }`}>
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white" 
                  />
                )}
              </div>
            </div>
            
            <div className="ml-4 flex-1">
              {/* Display label uses the shuffled display key (opt.key), not storedKey */}
              <span className={`font-bold mr-2 text-sm ${isSelected ? 'text-brand-700' : 'text-slate-500'}`}>
                Opsi {opt.key}
              </span>
              <div className="mt-1">
                {opt.text.startsWith('/image') ? (
                  <img
                    src={opt.text}
                    alt={`Opsi ${opt.key}`}
                    className="inline-block max-h-32 object-contain rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm"
                  />
                ) : (
                  <span className={`text-sm leading-relaxed whitespace-pre-wrap ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                    {opt.text}
                  </span>
                )}
              </div>
            </div>
          </motion.label>
        );
      })}
    </div>
  );
}
