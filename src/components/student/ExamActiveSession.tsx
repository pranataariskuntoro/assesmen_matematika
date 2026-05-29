'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import TimerBar from '@/components/exam/TimerBar';
import QuestionCard from '@/components/exam/QuestionCard';
import ViolationWarning from '@/components/exam/ViolationWarning';
import Select from '@/components/ui/Select';
import {
  ChevronRight,
  ChevronLeft,
  User,
  GraduationCap,
  Send,
  AlertCircle,
  School,
  Award,
  Clock,
  ClipboardList,
  Hash,
  Check,
  FileText,
  LayoutList,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleAllMCOptions, buildExamSeed } from '@/lib/shuffleOptions';
import { Modal } from '@/components/ui/Modal';

export default function ExamActiveSession() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();

  // currentStep: 
  // 1 = Biodata (Nama, Kelas, Absen)
  // 2 = Bagian 1: Pasangkan / Menjodohkan (Soal 1-8)
  // 3 = Bagian 2: Pilihan Ganda & Kompleks (Soal 9-20)
  // 4 = Bagian 3: Uraian / Essay (Soal 21-25)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Biodata states
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [noAbsen, setNoAbsen] = useState('');
  const [biodataError, setBiodataError] = useState('');
  const [setujuAturan, setSetujuAturan] = useState(false);

  // Questions and answers states
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState<any>(null);

  // Anti-cheat modal states
  const [warningData, setWarningData] = useState<{ count: number; remaining: number } | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);

  // Submission confirmation states
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [isSessionInactive, setIsSessionInactive] = useState(false);

  // Auto-save and Anti-cheat hooks
  const { debouncedSave, status: saveStatus } = useAutoSave(sessionId, submissionId);

  useAntiCheat({
    maxViolations: Number(process.env.NEXT_PUBLIC_MAX_VIOLATIONS || 3),
    sessionId,
    submissionId,
    onWarning: (count, remaining) => {
      setWarningData({ count, remaining });
      setShowViolationModal(true);
    },
    onTerminate: () => {
      setIsTerminated(true);
      setShowViolationModal(true);
    }
  });

  // Client-side option shuffling based on stable seed
  const examSeed = useMemo(
    () => (nama && noAbsen ? buildExamSeed(nama, noAbsen) : ''),
    [nama, noAbsen]
  );
  const displayQuestions = useMemo(
    () => (examSeed ? shuffleAllMCOptions(questions, examSeed) : questions),
    [questions, examSeed]
  );

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const savedSubmissionId = localStorage.getItem(`student_submission_id_${sessionId}`);
        const savedStep = localStorage.getItem(`current_exam_step_${sessionId}`);

        const res = await fetch('/api/exam/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            submissionId: savedSubmissionId || undefined
          }),
        });
        const data = await res.json();

        if (data.redirect) {
          router.replace(data.redirect);
          return;
        }

        if (data.success) {
          setQuestions(data.questions);
          setExamData(data);

          const savedBiodata = localStorage.getItem(`student_biodata_${sessionId}`);
          if (savedBiodata) {
            try {
              const parsed = JSON.parse(savedBiodata);
              setNama(parsed.nama || '');
              setKelas(parsed.kelas || '');
              setNoAbsen(parsed.noAbsen || '');
            } catch {
              // Ignore error
            }
          }

          if (data.submissionId) {
            setSubmissionId(data.submissionId);

            if (savedStep) {
              setCurrentStep(Number(savedStep) as 1 | 2 | 3 | 4);
            } else {
              setCurrentStep(2);
            }

            const localAns = localStorage.getItem(`exam_answers_${sessionId}`);
            const dbAnsMap: Record<string, any> = {};
            if (data.existingAnswers) {
              data.existingAnswers.forEach((a: any) => {
                dbAnsMap[a.questionNumber] = a.studentAnswer;
              });
            }

            if (localAns) {
              try {
                const parsedLocal = JSON.parse(localAns);
                setAnswers({ ...dbAnsMap, ...parsedLocal });
              } catch {
                setAnswers(dbAnsMap);
              }
            } else {
              setAnswers(dbAnsMap);
            }
          }
        } else {
          setIsSessionInactive(true);
          setBiodataError(data.message || 'Sesi Ujian tidak ditemukan.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [sessionId, router]);

  const handleAnswerChange = (questionId: string, questionNumber: number, val: any) => {
    setAnswers(prev => {
      const updated = { ...prev, [questionNumber]: val };
      localStorage.setItem(`exam_answers_${sessionId}`, JSON.stringify(updated));
      return updated;
    });
    debouncedSave(questionId, val);
  };

  const handleNextStep = (stepToGo: 1 | 2 | 3 | 4) => {
    localStorage.setItem(`current_exam_step_${sessionId}`, stepToGo.toString());
    setCurrentStep(stepToGo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setBiodataError('Nama Lengkap wajib diisi.');
      return;
    }
    if (!kelas) {
      setBiodataError('Kelas wajib diisi/dipilih.');
      return;
    }
    if (!noAbsen.trim()) {
      setBiodataError('Nomor Absen wajib diisi.');
      return;
    }

    setLoading(true);
    setBiodataError('');

    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          studentName: nama,
          studentClass: kelas,
          studentAbsen: Number(noAbsen),
        }),
      });
      const data = await res.json();

      if (data.redirect) {
        router.replace(data.redirect);
        return;
      }

      if (data.success && data.submissionId) {
        const biodata = { nama, kelas, noAbsen };
        localStorage.setItem(`student_biodata_${sessionId}`, JSON.stringify(biodata));
        localStorage.setItem(`student_submission_id_${sessionId}`, data.submissionId);

        setSubmissionId(data.submissionId);
        handleNextStep(2);

        const dbAnsMap: Record<string, any> = {};
        if (data.existingAnswers) {
          data.existingAnswers.forEach((a: any) => {
            dbAnsMap[a.questionNumber] = a.studentAnswer;
          });
        }
        const localAns = localStorage.getItem(`exam_answers_${sessionId}`);
        if (localAns) {
          try {
            const parsedLocal = JSON.parse(localAns);
            setAnswers({ ...dbAnsMap, ...parsedLocal });
          } catch {
            setAnswers(dbAnsMap);
          }
        } else {
          setAnswers(dbAnsMap);
        }
      } else {
        setBiodataError(data.message || 'Gagal meregistrasi biodata.');
      }
    } catch {
      setBiodataError('Koneksi internet bermasalah.');
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async (forceSubmit = false) => {
    if (!submissionId) return;

    setSubmitting(true);
    setShowSubmitConfirm(false);
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, submissionId, forceSubmit }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem(`exam_answers_${sessionId}`);
        localStorage.removeItem(`student_biodata_${sessionId}`);
        localStorage.removeItem(`student_submission_id_${sessionId}`);
        localStorage.removeItem(`current_exam_step_${sessionId}`);
        router.replace('/result');
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.05]" />
        <div className="text-brand-600 font-bold text-xl flex flex-col items-center gap-4 z-10">
          <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin shadow-inner"></div>
          <span className="font-display tracking-wide animate-pulse">Menyiapkan Lembar Ujian...</span>
        </div>
      </div>
    );
    if (isSessionInactive) {
      return (
        <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-4 font-sans relative overflow-hidden">
          {/* Floating background shapes */}
          <div className="absolute inset-0 bg-[radial-gradient(#3d5249_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.03]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-md w-full border border-slate-200/60 rounded-3xl p-8 text-center shadow-lg relative z-10 space-y-6"
          >
            <div className="w-20 h-20 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto text-accent-500 border border-accent-100 shadow-sm">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-800 font-display">Sesi Ujian ini telah berakhir.</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Maaf, sesi ujian ini saat ini tidak aktif atau sudah ditutup oleh admin.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed text-left">
              Silakan hubungi proktor, pengawas ruangan, atau guru mata pelajaran Anda jika Anda memerlukan akses kembali ke ujian ini.
            </div>

            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-lg transition-all cursor-pointer text-sm"
              >
                Segarkan Halaman
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    const step2Questions = questions.filter(q => q.type === 'matching');
    const step3Questions = displayQuestions.filter(q => q.type === 'multiple_choice' || q.type === 'multiple_response');
    const step4Questions = questions.filter(q => q.type === 'essay');

    const stepsDef = [
      { step: 1, label: 'Biodata', icon: User },
      { step: 2, label: 'Menjodohkan', icon: LayoutList },
      { step: 3, label: 'Pilihan Ganda', icon: ClipboardList },
      { step: 4, label: 'Essay / Uraian', icon: FileText }
    ];

    return (
      <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20 font-sans relative overflow-x-hidden">
        {currentStep > 1 && (
          <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm px-3 py-2 md:px-4 md:py-3 transition-all">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2 md:space-x-3 overflow-hidden mr-2">
                <div className="w-8 h-8 md:w-9 md:h-9 bg-brand-50 rounded-full flex-shrink-0 flex items-center justify-center text-brand-600 font-bold text-xs md:text-sm border border-brand-100 shadow-sm">
                  {nama ? nama.trim().charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] md:text-[10px] font-bold text-brand-600 uppercase tracking-widest leading-none mb-0.5 md:mb-1">Peserta Ujian</span>
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className="text-xs md:text-sm font-bold text-slate-800 truncate">
                      {nama}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60 flex-shrink-0">
                      {kelas} • #{noAbsen}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 md:space-x-4 flex-shrink-0">
                <div className="text-xs font-medium hidden sm:block">
                  {saveStatus === 'saving' && (
                    <span className="text-accent-600 flex items-center bg-accent-50 px-2.5 py-1 rounded-full border border-accent-100/50">
                      <Clock className="w-3 h-3 mr-1 animate-spin" /> Menyimpan...
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-brand-700 flex items-center bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100/50 font-semibold">
                      <Check className="w-3 h-3 mr-1" /> Tersimpan
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-accent-600 flex items-center bg-accent-50 px-2.5 py-1 rounded-full border border-accent-100/50">
                      Gagal
                    </span>
                  )}
                </div>

                {examData?.startTime && (
                  <TimerBar
                    durationMinutes={examData.duration}
                    startTime={examData.startTime}
                    onTimeUp={() => submitExam(true)}
                  />
                )}
              </div>
            </div>
          </header>
        )}

        <div className="max-w-4xl mx-auto px-3 md:px-4 mt-6 md:mt-8 relative z-10">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-3 md:p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-500/10">
                  <School className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <h2 className="text-xs md:text-sm font-bold text-slate-800 tracking-wide font-display">Asesmen Sekolah SMKN 31</h2>
                  <p className="text-[10px] md:text-xs text-slate-400">Lembar Ujian Digital Matematika</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-1">
                {stepsDef.map((s, idx) => {
                  const StepIcon = s.icon;
                  const isCompleted = currentStep > s.step;
                  const isActive = currentStep === s.step;

                  return (
                    <div key={s.step} className="flex items-center">
                      <button
                        onClick={() => {
                          if (s.step === 1) return;
                          handleNextStep(s.step as 1 | 2 | 3 | 4);
                        }}
                        disabled={!submissionId || (s.step === 1 && !!submissionId)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
                          : isCompleted
                            ? 'bg-brand-50 text-brand-700 border border-brand-100'
                            : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <StepIcon className="w-3.5 h-3.5" />
                        )}
                        <span>{s.label}</span>
                      </button>
                      {idx < stepsDef.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-slate-300 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex md:hidden items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700 bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded text-[10px]">
                    Bagian {currentStep}/4
                  </span>
                  <span className="font-bold text-slate-700">
                    {stepsDef[currentStep - 1]?.label}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {stepsDef.map((s) => {
                    const isCompleted = currentStep > s.step;
                    const isActive = currentStep === s.step;
                    return (
                      <button
                        key={s.step}
                        disabled={!submissionId || (s.step === 1 && !!submissionId)}
                        onClick={() => {
                          if (s.step === 1) return;
                          handleNextStep(s.step as 1 | 2 | 3 | 4);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer disabled:cursor-not-allowed ${isActive
                          ? 'bg-brand-600 ring-2 ring-brand-500/20 scale-110'
                          : isCompleted
                            ? 'bg-brand-500'
                            : 'bg-slate-200'
                          }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-6">
            <div className="h-2 bg-brand-400" />
            <div className="p-5 md:p-8 relative">
              <div className="absolute right-4 bottom-2 pointer-events-none select-none z-0 opacity-[0.02] text-slate-800 hidden md:block">
                <School className="w-32 h-32" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-brand-100">
                    <Award className="w-3.5 h-3.5" />
                    <span>Ujian Tengah Semester Ganjil</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight font-display">
                    {examData?.name || "Asesmen Matematika XI"}
                  </h1>
                  <p className="text-xs font-medium text-slate-400 mt-1 flex items-center">
                    <School className="w-3.5 h-3.5 mr-1" /> SMKN 31 Jakarta - Tahun Ajaran 2025/2026
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full md:w-auto md:min-w-[320px]">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Mata Pelajaran</span>
                    <span className="text-xs font-bold text-slate-700 truncate block mt-0.5">{examData?.subject || "Matematika"}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Durasi</span>
                    <span className="text-xs font-bold text-slate-700 block mt-0.5">{examData?.duration || 90} Menit</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Jumlah Soal</span>
                    <span className="text-xs font-bold text-slate-700 block mt-0.5">{questions.length} Soal</span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 my-5" />
              <div className="bg-brand-50/50 border border-brand-100/50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-brand-800 leading-relaxed">
                  <strong className="font-semibold block mb-0.5">Petunjuk & Aturan Penting:</strong>
                  Sistem ujian dilengkapi dengan <strong>Anti-Cheat</strong>. Meninggalkan halaman ujian, berpindah tab browser, atau menekan tombol pintasan keyboard terlarang akan dicatat sebagai pelanggaran. Melebihi batas pelanggaran akan menyebabkan ujian diselesaikan secara otomatis oleh sistem.
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                onSubmit={handleNextSection}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 rounded-t-2xl">
                    <div className="flex items-center space-x-2.5 text-white">
                      <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
                        ID
                      </div>
                      <div>
                        <h3 className="text-sm font-bold tracking-wide font-display">Biodata Peserta</h3>
                        <p className="text-[10px] text-slate-400">Pastikan data yang diisi valid & sesuai kartu ujian</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 space-y-6 relative">
                    <div className="absolute inset-0 rounded-b-2xl overflow-hidden pointer-events-none z-0">
                      <div className="absolute right-4 bottom-4 opacity-[0.02] text-slate-800">
                        <GraduationCap className="w-36 h-36 transform rotate-12" />
                      </div>
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand-500" />
                          Nama Lengkap <span className="text-accent-500">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            required
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Ketik nama lengkap Anda sesuai absen"
                            className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-slate-800 transition-all font-medium text-sm shadow-inner placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-brand-500" />
                            Kelas <span className="text-accent-500">*</span>
                          </label>
                          <Select
                            required
                            value={kelas}
                            onChange={setKelas}
                            options={[
                              { value: "XI Akuntansi", label: "XI Akuntansi" },
                              { value: "XI Animasi", label: "XI Animasi" },
                              { value: "XI Bisnis Ritel", label: "XI Bisnis Ritel" },
                              { value: "XI DKV", label: "XI DKV" },
                              { value: "XI Layanan Perbankan", label: "XI Layanan Perbankan" },
                              { value: "XI Manajemen Perkantoran", label: "XI Manajemen Perkantoran" },
                            ]}
                            placeholder="Pilih Kelas"
                            icon={<GraduationCap className="w-4 h-4 text-brand-500" />}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-brand-500" />
                            Nomor Urut Absen <span className="text-accent-500">*</span>
                          </label>
                          <div className="relative group">
                            <input
                              type="number"
                              min="1"
                              max="50"
                              required
                              value={noAbsen}
                              onChange={(e) => setNoAbsen(e.target.value)}
                              placeholder="Contoh: 15"
                              className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-slate-800 transition-all font-medium text-sm shadow-inner placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {biodataError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-accent-50 text-accent-750 p-4 rounded-2xl border border-accent-200 flex items-start gap-3 text-sm shadow-sm"
                  >
                    <AlertCircle className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Terjadi kesalahan</span>
                      <span>{biodataError}</span>
                    </div>
                  </motion.div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agree-rules"
                    checked={setujuAturan}
                    onChange={(e) => setSetujuAturan(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-brand-600 border-slate-300 rounded focus:ring-brand-400 cursor-pointer"
                  />
                  <label htmlFor="agree-rules" className="text-xs text-slate-600 leading-relaxed cursor-pointer font-medium">
                    Saya menyetujui bahwa jika saya meninggalkan halaman ujian atau berpindah tab browser lebih dari 3 kali, ujian akan dihentikan secara otomatis oleh sistem dan jawaban saya akan langsung terkirim.
                  </label>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    * Menunjukkan kolom wajib diisi
                  </div>
                  <button
                    type="submit"
                    disabled={!setujuAturan}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 flex items-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mulai Ujian
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.form>
            ) : currentStep === 2 ? (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center gap-2.5 mb-3 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                      <LayoutList className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-800 font-display">
                      Bagian 1: Pasangkan / Menjodohkan
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hubungkan atau pasangkan antara pernyataan di Kolom A dengan istilah yang tepat di Kolom B.
                    Pilih atau ketik jawaban huruf (A s.d. N) pada dropdown / kotak hijau yang disediakan.
                  </p>
                </div>

                <div className="space-y-6">
                  {step2Questions.map((q) => (
                    <div key={q._id} className="relative">
                      <QuestionCard
                        question={q}
                        answer={answers[q.number]}
                        onAnswer={(val) => handleAnswerChange(q._id, q.number, val)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                  {!submissionId ? (
                    <button
                      onClick={() => handleNextStep(1)}
                      className="text-slate-600 hover:bg-slate-100 border border-slate-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm bg-white cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Kembali
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => handleNextStep(3)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    Berikutnya <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : currentStep === 3 ? (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center gap-2.5 mb-3 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-800 font-display">
                      Bagian 2: Pilihan Ganda & Kompleks
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pilihlah salah satu jawaban yang paling tepat untuk masing-masing soal di bawah ini.
                  </p>
                </div>

                <div className="space-y-6">
                  {step3Questions.map((q) => (
                    <div key={q._id} className="relative">
                      <QuestionCard
                        question={q}
                        answer={answers[q.number]}
                        onAnswer={(val) => handleAnswerChange(q._id, q.number, val)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                  <button
                    onClick={() => handleNextStep(2)}
                    className="text-slate-600 hover:bg-slate-100 border border-slate-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Kembali
                  </button>

                  <button
                    onClick={() => handleNextStep(4)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    Ke Soal Essay <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center gap-2.5 mb-3 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-800 font-display">
                      Bagian 3: Uraian / Essay
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Jawablah pertanyaan essay di bawah ini secara mandiri dengan cara menuliskan langkah pengerjaan atau jawaban Anda di kolom textarea yang disediakan.
                  </p>
                </div>

                <div className="space-y-6">
                  {step4Questions.map((q) => (
                    <div key={q._id} className="relative">
                      <QuestionCard
                        question={q}
                        answer={answers[q.number]}
                        onAnswer={(val) => handleAnswerChange(q._id, q.number, val)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                  <button
                    onClick={() => handleNextStep(3)}
                    className="text-slate-600 hover:bg-slate-100 border border-slate-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Kembali
                  </button>

                  <button
                    onClick={() => {
                      const unanswered = questions.length - Object.keys(answers).length;
                      setUnansweredCount(unanswered);
                      setShowSubmitConfirm(true);
                    }}
                    disabled={submitting}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        Kirim Jawaban
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showViolationModal && (
          <ViolationWarning
            count={warningData?.count || 0}
            remaining={warningData?.remaining || 0}
            isTerminated={isTerminated}
            onUnderstand={() => {
              if (isTerminated) {
                localStorage.removeItem(`exam_answers_${sessionId}`);
                localStorage.removeItem(`student_biodata_${sessionId}`);
                localStorage.removeItem(`student_submission_id_${sessionId}`);
                localStorage.removeItem(`current_exam_step_${sessionId}`);
                router.replace('/result');
              } else {
                setShowViolationModal(false);
              }
            }}
          />
        )}

        {showSubmitConfirm && (
          <Modal
            isOpen={showSubmitConfirm}
            onClose={() => setShowSubmitConfirm(false)}
            title="Konfirmasi Kirim Jawaban"
            className="max-w-md"
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-650 leading-relaxed">
                {unansweredCount > 0 ? (
                  <>
                    Kamu masih memiliki <strong className="text-accent-750 font-bold">{unansweredCount} soal</strong> yang belum dijawab. Apakah kamu yakin ingin menyelesaikan ujian dan mengirim semua jawaban sekarang?
                  </>
                ) : (
                  "Apakah kamu yakin ingin menyelesaikan ujian dan mengirim semua jawaban? Tindakan ini tidak dapat dibatalkan."
                )}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => submitExam(false)}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-md shadow-brand-500/10 text-sm font-bold cursor-pointer"
                >
                  Ya, Kirim
                </button>
              </div>
            </div>
          </Modal>
        )}

        {submitting && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center border border-slate-100 max-w-sm">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-slate-700 font-bold text-sm">Mengirim Lembar Jawaban ke Server...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
