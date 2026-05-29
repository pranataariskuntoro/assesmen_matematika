'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface MatchingPair {
  statement: string;
}

interface MatchingQuestionProps {
  statements: MatchingPair[];
  options: string[];
  selectedAnswers: Record<string, string>; // e.g. { '0': 'E', '1': 'A' }
  onSelect: (answers: Record<string, string>) => void;
}

export default function MatchingQuestion({ statements, options, selectedAnswers, onSelect }: MatchingQuestionProps) {
  
  const handleInputChange = (index: number, val: string) => {
    // Only accept characters from A to N and normalize to uppercase
    const cleaned = val.toUpperCase().replace(/[^A-N]/g, '');
    
    if (cleaned) {
      // Check if this letter is already used in another statement
      const isUsedElsewhere = Object.entries(selectedAnswers).some(
        ([key, v]) => v === cleaned && key !== index.toString()
      );
      if (isUsedElsewhere) {
        // Ignore input if already selected elsewhere
        return;
      }
    }
    
    const newAnswers = { ...selectedAnswers, [index.toString()]: cleaned };
    onSelect(newAnswers);
  };

  // Helper to parse letter and clean option text
  const parsedOptions = options.map(opt => {
    const match = opt.match(/^([A-N])\.\s*(.*)/i);
    if (match) {
      return {
        letter: match[1].toUpperCase(),
        text: match[2],
        full: opt
      };
    }
    return {
      letter: opt.charAt(0).toUpperCase(),
      text: opt,
      full: opt
    };
  });

  return (
    <div className="mt-4 space-y-6">
      {/* Table Container (Unified for Mobile & Desktop as requested) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider w-12 border-r border-slate-200">No.</th>
              <th className="px-4 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Pernyataan (A)</th>
              <th className="px-3 py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider w-24">Jawaban</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {statements.map((pair, idx) => {
              const currentAnswer = selectedAnswers[idx.toString()] || '';
              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  {/* Number Column */}
                  <td className="px-3 py-4 text-center text-slate-700 font-bold border-r border-slate-200">
                    {idx + 1}.
                  </td>
                  {/* Statement Column */}
                  <td className="px-4 py-4 text-slate-700 font-medium leading-relaxed border-r border-slate-200">
                    {pair.statement}
                  </td>
                  {/* Selection Box Column */}
                  <td className="px-3 py-4">
                    <div className="flex justify-center items-center">
                      <input
                        type="text"
                        maxLength={1}
                        value={currentAnswer}
                        onChange={(e) => handleInputChange(idx, e.target.value)}
                        placeholder=""
                        className={`w-12 h-12 text-center text-lg font-extrabold border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-400/10 bg-white text-slate-800 transition-all uppercase ${
                          currentAnswer 
                            ? 'border-brand-400 ring-2 ring-brand-500/5' 
                            : 'border-slate-200 focus:border-brand-400'
                        }`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Options List ("PERNYATAAN (B)" Card below the table) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2.5 uppercase tracking-wider text-xs text-center flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          Pernyataan (B)
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {parsedOptions.map((opt, idx) => {
            const isUsed = Object.values(selectedAnswers).some(
              ans => ans === opt.letter
            );
            
            return (
              <li 
                key={idx} 
                className={`text-xs p-3 rounded-xl border transition-all ${
                  isUsed 
                    ? 'text-slate-350 line-through bg-slate-50 border-slate-100/60 font-normal' 
                    : 'text-slate-700 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 font-semibold'
                }`}
              >
                <span className="text-brand-500 font-bold mr-1">{opt.letter}.</span>
                {opt.text}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}


