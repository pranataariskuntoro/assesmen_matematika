'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, CheckSquare, Square, Copy, Calendar, Clock, BookOpen, User, HelpCircle } from 'lucide-react';

export default function SessionsView() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [duration, setDuration] = useState(90);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  const availableClasses = [
    'XI Akuntansi', 'XI Animasi', 'XI Bisnis Ritel', 'XI DKV',
    'XI Layanan Perbankan', 'XI Manajemen Perkantoran',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSessions, resQuestions] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/questions')
      ]);
      const dataSessions = await resSessions.json();
      const dataQuestions = await resQuestions.json();

      if (dataSessions.success) setSessions(dataSessions.data);
      if (dataQuestions.success) setQuestions(dataQuestions.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setSelectedSession(null);
    setName('');
    setSubject('Matematika');
    setDuration(90);
    setSelectedQuestionIds([]);
    setAllowedClasses([]);
    setIsActive(false);
    setIsModalOpen(true);
  };

  const handleEdit = (session: any) => {
    setSelectedSession(session);
    setName(session.name);
    setSubject(session.subject || 'Matematika');
    setDuration(session.duration || 90);
    setSelectedQuestionIds(session.questionIds?.map((q: any) => q._id) || []);
    setAllowedClasses(session.allowedClasses || []);
    setIsActive(session.isActive || false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      subject,
      duration: Number(duration),
      questionIds: selectedQuestionIds,
      allowedClasses,
      isActive,
    };

    try {
      const url = selectedSession
        ? `/api/sessions/${selectedSession._id}`
        : '/api/sessions';
      const method = selectedSession ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus sesi ujian ini?')) return;
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleQuestionSelection = (qId: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const toggleClassSelection = (cls: string) => {
    setAllowedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const copySessionLink = (id: string) => {
    const link = `${window.location.origin}/exam/${id}`;
    navigator.clipboard.writeText(link);
    alert('Link Ujian disalin ke clipboard!\n\nLink: ' + link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-[72px] z-20 bg-[#F8FAF8]/95 backdrop-blur-md -mx-6 md:-mx-8 px-6 md:px-8 py-4.5 -mt-6 md:-mt-8 border-b border-slate-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-display font-extrabold text-slate-800">Sesi Ujian</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Kelola rilis ujian, waktu pengerjaan, dan token sesi siswa.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/10 h-10 px-4">
          <Plus className="w-4 h-4" /> Buat Sesi Baru
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white text-center py-12 border border-slate-200/50 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-xs font-medium">Belum ada sesi ujian yang dibuat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div key={session._id} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-display font-extrabold text-slate-800 leading-snug text-base md:text-[17px]">{session.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 mt-1.5 font-semibold text-[11px] uppercase tracking-wider">
                      <span>{session.subject}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {session.duration} Menit</span>
                    </div>
                  </div>
                  <Badge variant={session.isActive ? 'success' : 'default'} className="shrink-0 rounded-full font-bold px-3 py-1">
                    {session.isActive ? 'Aktif' : 'Draft'}
                  </Badge>
                </div>

                <div className="h-[1px] bg-slate-100" />

                <div className="text-xs space-y-2.5 text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span><strong>Soal:</strong> {session.questionIds?.length || 0} Pertanyaan terpilih</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="line-clamp-2"><strong>Kelas:</strong> {session.allowedClasses?.join(', ') || 'Semua Kelas'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-2 pt-5 mt-5 border-t border-slate-55 bg-white">
                <Button variant="ghost" size="sm" onClick={() => copySessionLink(session._id)} className="text-brand-700 hover:bg-brand-50 hover:text-brand-850 gap-1.5 h-9 rounded-xl font-semibold">
                  <Copy className="w-3.5 h-3.5" /> Salin Link
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(session)} className="gap-1.5 h-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(session._id)} className="gap-1.5 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 border-none font-medium">
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSession ? 'Edit Sesi Ujian' : 'Buat Sesi Ujian Baru'}
        className="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Nama Sesi Ujian</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="PTS Matematika XI 2026"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-700 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Mata Pelajaran</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Matematika"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-700 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Durasi (Menit)</label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold text-slate-750 transition-all"
              />
            </div>

            <div className="flex items-center pt-6 gap-2.5">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4.5 h-4.5 text-brand-600 focus:ring-brand-500/20 border-slate-350 rounded cursor-pointer accent-brand-500"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                Aktifkan Sesi Ini (Bisa mulai dikerjakan siswa)
              </label>
            </div>
          </div>

          {/* Classes selectors */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Kelas yang Diizinkan</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
              {availableClasses.map((cls) => {
                const isSelected = allowedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClassSelection(cls)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-800'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                  >
                    <span>{cls}</span>
                    {isSelected ? <CheckSquare className="w-4 h-4 ml-1.5 text-brand-650" /> : <Square className="w-4 h-4 ml-1.5 text-slate-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions list selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">
              Pilih Pertanyaan dari Bank Soal ({selectedQuestionIds.length} Soal dipilih)
            </label>
            <div className="max-h-60 overflow-y-auto border border-slate-200/60 rounded-xl divide-y divide-slate-100 p-2 space-y-2 bg-slate-50/30">
              {questions.length === 0 ? (
                <p className="text-slate-400 text-xs font-medium text-center py-4">Belum ada soal tersedia di Bank Soal.</p>
              ) : (
                questions.map((q) => {
                  const isSelected = selectedQuestionIds.includes(q._id);
                  return (
                    <div
                      key={q._id}
                      onClick={() => toggleQuestionSelection(q._id)}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-brand-200 bg-brand-50/20 shadow-sm' : 'border-transparent hover:bg-slate-50/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 text-brand-600 focus:ring-brand-500/20 border-slate-350 rounded mt-0.5 accent-brand-500"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <span>Soal {q.number}</span>
                          <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-100 rounded-full">{q.points} Poin</span>
                        </p>
                        <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed">{q.questionText}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-slate-200 text-slate-600 font-medium">Batal</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/10">Simpan Sesi</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
