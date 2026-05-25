'use client';

import { useState } from 'react';

interface MatchingPair {
  statement: string;
}

interface MatchingQuestionProps {
  statements: MatchingPair[];
  options: string[];
  selectedAnswers: Record<string, string>; // e.g. { '0': 'A', '1': 'B' }
  onSelect: (answers: Record<string, string>) => void;
}

export default function MatchingQuestion({ statements, options, selectedAnswers, onSelect }: MatchingQuestionProps) {
  
  const handleSelect = (index: number, value: string) => {
    const newAnswers = { ...selectedAnswers, [index.toString()]: value };
    onSelect(newAnswers);
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Pernyataan */}
        <div className="space-y-4">
          <h4 className="font-bold text-brand-700 mb-4 bg-brand-50 p-2 rounded-lg text-center">Kolom Pernyataan</h4>
          {statements.map((pair, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-300 transition-colors">
              <span className="text-gray-800 flex-1 mr-4 mb-3 md:mb-0 text-sm leading-relaxed">
                <strong className="mr-2">{idx + 1}.</strong> {pair.statement}
              </span>
              <select
                value={selectedAnswers[idx.toString()] || ''}
                onChange={(e) => handleSelect(idx, e.target.value)}
                className="w-full md:w-32 p-2 border-2 border-brand-200 rounded-lg bg-gray-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-brand-900 font-bold text-center cursor-pointer"
              >
                <option value="" disabled>Pilih</option>
                {options.map((opt) => {
                  const val = opt.charAt(0); // get 'A', 'B', etc
                  return (
                    <option key={val} value={val}>{val}</option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>

        {/* Kolom Opsi */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-4 h-fit">
          <h4 className="font-bold text-gray-700 mb-4 border-b-2 border-gray-200 pb-2">Pilihan Jawaban (Kolom B)</h4>
          <ul className="space-y-3">
            {options.map((opt, idx) => {
              const val = opt.charAt(0);
              // Check if option is already selected in any statement
              const isSelected = Object.values(selectedAnswers).includes(val);
              
              return (
                <li key={idx} className={`text-sm p-2 rounded-lg transition-colors ${isSelected ? 'text-gray-400 line-through bg-gray-100' : 'text-gray-700 bg-white shadow-sm border border-gray-100'}`}>
                  {opt}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
