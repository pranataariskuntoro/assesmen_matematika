'use client';

interface MultipleResponseProps {
  options: { key: string; text: string; originalKey?: string }[];
  /** The currently stored answer – always the originalKey from DB */
  selectedOption: string;
  onSelect: (originalKey: string) => void;
  statementsText: string;
  name: string;
}

export default function MultipleResponse({ options, selectedOption, onSelect, statementsText, name }: MultipleResponseProps) {
  return (
    <div className="space-y-6 mt-6">
      {statementsText ? (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-gray-800 whitespace-pre-wrap">{statementsText}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => {
          const storedKey = opt.originalKey ?? opt.key;
          const isSelected = selectedOption === storedKey;

          return (
            <label
              key={opt.key}
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
                    <div className="w-2 h-2 rounded-full bg-white animate-[scale-up_0.15s_ease-out]" />
                  )}
                </div>
              </div>
              <div className="ml-4 flex-1">
                {/* Display label uses the shuffled display key (opt.key) */}
                <span className={`font-bold mr-2 text-sm ${isSelected ? 'text-brand-700' : 'text-slate-500'}`}>
                  Opsi {opt.key}
                </span>
                <div className="mt-1">
                  {opt.text.startsWith('/image') ? (
                    <img src={opt.text} alt={`Opsi ${opt.key}`} className="inline-block max-h-32 object-contain rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm" />
                  ) : (
                    <span className={`text-sm leading-relaxed whitespace-pre-wrap ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                      {opt.text}
                    </span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
