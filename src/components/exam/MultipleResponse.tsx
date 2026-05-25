'use client';

import { useState, useEffect } from 'react';

interface MultipleResponseProps {
  options: { key: string; text: string }[];
  selectedOption: string; // The final answer A, B, C, D, E
  onSelect: (key: string) => void;
  statementsText: string;
}

export default function MultipleResponse({ options, selectedOption, onSelect, statementsText }: MultipleResponseProps) {
  // Statements are passed via statementsText, we'll just render it pre-formatted
  return (
    <div className="space-y-6 mt-6">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <p className="text-gray-800 whitespace-pre-wrap">{statementsText}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => (
          <label
            key={opt.key}
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === opt.key
                ? 'border-brand-600 bg-brand-50'
                : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="multiple-response"
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
          </label>
        ))}
      </div>
    </div>
  );
}
