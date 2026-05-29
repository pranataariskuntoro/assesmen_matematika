'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  required = false,
  icon
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-4 pr-10 py-3.5 bg-slate-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-200 text-left font-medium text-sm cursor-pointer ${
          isOpen
            ? 'border-brand-400 bg-white ring-4 ring-brand-400/10'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <div className="text-slate-450 flex-shrink-0">{icon}</div>}
          <span className={`truncate ${selectedOption ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className="absolute right-4 top-4.5 pointer-events-none text-slate-455 transition-transform duration-200">
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      {/* Hidden input to support native form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="absolute inset-x-0 bottom-0 h-0 w-full opacity-0 pointer-events-none"
        />
      )}

      {/* Dropdown Options List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden max-h-60 overflow-y-auto mt-1 divide-y divide-slate-50"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-700 hover:bg-brand-50/30 hover:text-brand-800'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <motion.div 
                      layoutId="active-dot"
                      className="w-1.5 h-1.5 rounded-full bg-accent-500" 
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
