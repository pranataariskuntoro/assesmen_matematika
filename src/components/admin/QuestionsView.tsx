'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { QuestionEditor } from '@/components/admin/QuestionEditor';
import { Plus, Trash2, Edit2, Search, Filter, BookOpen } from 'lucide-react';
import Select from '@/components/ui/Select';

export default function QuestionsView() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const filterOptions = [
    { value: 'all', label: 'Semua Tipe' },
    { value: 'multiple_choice', label: 'Pilihan Ganda' },
    { value: 'multiple_response', label: 'Pilihan Ganda Kompleks' },
    { value: 'matching', label: 'Menjodohkan' },
    { value: 'essay', label: 'Uraian / Essay' },
  ];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions?type=${filterType}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterType]);

  const handleCreate = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (question: any) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      const url = selectedQuestion 
        ? `/api/questions/${selectedQuestion._id}`
        : '/api/questions';
      
      const method = selectedQuestion ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error saving question:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  // Filter questions based on search term
  const filteredQuestions = questions.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-355">
      <div className="sticky top-[72px] z-20 bg-[#F8FAF8]/95 backdrop-blur-md -mx-6 md:-mx-8 px-6 md:px-8 py-4.5 -mt-6 md:-mt-8 border-b border-slate-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-display font-extrabold text-slate-800">Bank Soal Asesmen</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Kelola daftar pertanyaan, kategori, dan poin jawaban.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/10 h-10 px-4">
          <Plus className="w-4 h-4" /> Tambah Soal
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/50">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari soal berdasarkan pertanyaan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all duration-200 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex gap-2 items-center min-w-[200px]">
          <Select
            value={filterType}
            onChange={setFilterType}
            options={filterOptions}
            placeholder="Pilih Tipe Soal"
            icon={<Filter className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white text-center py-12 border border-slate-200/50 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-xs font-medium">Belum ada soal yang sesuai dengan kriteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div key={q._id} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-md hover:border-slate-350 transition-all duration-300">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Soal {q.number}
                  </span>
                  {q.type === 'multiple_choice' && <Badge variant="info">Pilihan Ganda</Badge>}
                  {q.type === 'multiple_response' && <Badge variant="warning">Pilihan Ganda Kompleks</Badge>}
                  {q.type === 'matching' && <Badge variant="success">Menjodohkan</Badge>}
                  {q.type === 'essay' && <Badge variant="default">Essay</Badge>}
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{q.points} Poin</span>
                </div>
                <p className="text-slate-800 text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                  {q.questionText}
                </p>
              </div>

              <div className="flex gap-2.5 self-end md:self-center shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(q)} className="gap-1.5 h-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-medium">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(q._id)} className="gap-1.5 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 border-none font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal wrapper */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
        className="max-w-2xl"
      >
        <QuestionEditor
          initialData={selectedQuestion}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
