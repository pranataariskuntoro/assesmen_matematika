'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        let submissionId = searchParams.get('submissionId');
        
        // If not in URL, try to get from localStorage
        if (!submissionId) {
          const savedSessionId = localStorage.getItem('active_exam_session_id');
          if (savedSessionId) {
            submissionId = localStorage.getItem(`student_submission_id_${savedSessionId}`);
          }
        }

        if (!submissionId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/exam/result?submissionId=${submissionId}`);
        const data = await res.json();
        if (data.success) {
          setSubmission(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3d5249_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.03]" />
        <div className="text-brand-600 font-bold text-xl flex flex-col items-center gap-4 z-10">
          <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin shadow-inner"></div>
          <span className="font-display tracking-wide animate-pulse">Memuat Hasil...</span>
        </div>
      </div>
    );
  }

  const isViolator = submission?.isTerminated || (submission?.violationCount > 3);

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Floating background shapes */}
      <div className="absolute inset-0 bg-[radial-gradient(#3d5249_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.03]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl max-w-xl w-full p-8 text-center border-t-8 relative z-10 border-brand-600 space-y-6"
      >
        {isViolator ? (
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-sm animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto border border-green-100 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black text-slate-800 font-display">
            {isViolator ? 'Ujian Selesai (Sanksi Pelanggaran)' : 'Ujian Selesai!'}
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {isViolator
              ? 'Lembar ujian Anda ditutup dan dikirim secara otomatis karena terdeteksi pelanggaran batas keluar halaman/tab.'
              : 'Jawaban Anda telah berhasil terkirim dan direkam secara aman oleh sistem.'}
          </p>
        </div>

        {isViolator && (
          <div className="bg-red-50 border border-red-200/60 rounded-2xl p-4 text-xs font-semibold text-red-800 leading-relaxed text-left flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Peringatan Sistem:</strong> Ujian dinyatakan selesai karena pelanggaran. Aktivitas meninggalkan tab, mengklik kanan, atau berpindah fokus jendela terdeteksi melebihi batas toleransi.
            </span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 text-sm uppercase tracking-wider">
            Detail Informasi
          </h3>
          <ul className="space-y-3 text-xs text-slate-600">
            {submission && (
              <>
                <li className="flex justify-between items-center">
                  <span>Nama Peserta:</span>
                  <span className="font-bold text-slate-800">{submission.studentName}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Kelas / Absen:</span>
                  <span className="font-semibold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                    {submission.studentClass} • #{submission.studentAbsen}
                  </span>
                </li>
              </>
            )}
            <li className="flex justify-between items-center">
              <span>Status Ujian:</span>
              {isViolator ? (
                <span className="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-100">
                  Diberhentikan Sistem
                </span>
              ) : (
                <span className="font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded border border-green-100">
                  Selesai & Dikirim
                </span>
              )}
            </li>
            <li className="flex justify-between items-center">
              <span>Jumlah Pelanggaran:</span>
              <span className={`font-bold ${isViolator ? 'text-red-600 bg-red-50' : 'text-slate-700 bg-slate-100'} px-2.5 py-0.5 rounded border border-slate-200/50`}>
                {submission ? `${submission.violationCount} kali` : '-'}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Penilaian Essay:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100">
                Menunggu Guru
              </span>
            </li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              router.push('/');
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Utama
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3d5249_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.03]" />
        <div className="text-brand-600 font-bold text-xl flex flex-col items-center gap-4 z-10">
          <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin shadow-inner"></div>
          <span className="font-display tracking-wide animate-pulse">Memuat Hasil...</span>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
