'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Plus, Trash2, Save, X, Info } from 'lucide-react';
import Select from '@/components/ui/Select';

interface QuestionEditorProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function QuestionEditor({ initialData, onSave, onCancel }: QuestionEditorProps) {
  const [type, setType] = useState(initialData?.type || 'multiple_choice');
  const [questionText, setQuestionText] = useState(initialData?.questionText || '');
  const [points, setPoints] = useState(initialData?.points || 5);
  const [options, setOptions] = useState(initialData?.options || [
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
    { key: 'E', text: '' },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || 'A');

  const handleSave = () => {
    onSave({
      type,
      questionText,
      points: Number(points),
      options: (type === 'multiple_choice' || type === 'multiple_response') ? options : undefined,
      correctAnswer: type === 'essay' ? null : correctAnswer,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const questionTypeOptions = [
    { value: 'multiple_choice', label: 'Pilihan Ganda' },
    { value: 'multiple_response', label: 'Pilihan Ganda Kompleks' },
    { value: 'matching', label: 'Menjodohkan' },
    { value: 'essay', label: 'Uraian / Essay' },
  ];

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Tipe Soal</label>
          <div className="mt-1">
            <Select
              value={type}
              onChange={setType}
              options={questionTypeOptions}
              placeholder="Pilih Tipe Soal"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Poin Dasar</label>
          <input 
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="mt-1 block w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-semibold text-slate-700 transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Teks Soal</label>
        <textarea
          rows={4}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Tuliskan pertanyaan ujian di sini..."
          className="mt-1 block w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium text-slate-700 transition-all placeholder:text-slate-400"
        />
      </div>

      {(type === 'multiple_choice' || type === 'multiple_response') && (
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider border-b border-slate-100 pb-2">Opsi Jawaban & Kunci</label>
          <div className="space-y-3">
            {options.map((opt: any, index: number) => (
              <div key={opt.key} className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={opt.key}
                  checked={correctAnswer === opt.key}
                  onChange={() => setCorrectAnswer(opt.key)}
                  className="focus:ring-brand-500 h-4.5 w-4.5 text-brand-600 border-slate-350 cursor-pointer accent-brand-500"
                />
                <span className="font-display font-extrabold w-5 text-slate-500 text-sm text-center">{opt.key}</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Isi jawaban pilihan ${opt.key}`}
                  className="block w-full bg-white border border-slate-200/80 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium text-slate-750 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'essay' && (
        <div className="bg-brand-50/40 p-4 rounded-xl text-xs font-semibold text-brand-800 border border-brand-100/60 flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-brand-650 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Soal uraian (essay) tidak memerlukan kunci jawaban eksak. Hasil jawaban siswa akan dinilai secara manual oleh guru melalui menu <span className="font-bold underline text-brand-700">Hasil Ujian</span> setelah ujian selesai.
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl border-slate-200 text-slate-600 font-medium">Batal</Button>
        <Button onClick={handleSave} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/10">
          <Save className="w-4 h-4" /> Simpan Soal
        </Button>
      </div>
    </div>
  );
}
