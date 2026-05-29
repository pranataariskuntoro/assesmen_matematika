'use client';

import { useState, useEffect } from 'react';
import { connectDB } from '@/lib/mongodb';
import { AlertCircle, Printer, ArrowLeft } from 'lucide-react';

export default function PrintResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/results');
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (err) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Automatically trigger print when loaded, and auto-close tab when finished/cancelled
  useEffect(() => {
    if (!loading && results.length > 0) {
      const printTimer = setTimeout(() => {
        window.focus();
        window.print();
      }, 800); // 800ms delay to ensure styles and tables are fully painted

      const handleAfterPrint = () => {
        // Safe check to only remove iframe if inside one, or close window if standalone
        if (window.self !== window.top) {
          const iframe = window.parent.document.getElementById('print-iframe');
          if (iframe) iframe.remove();
        } else {
          window.close();
        }
      };

      window.addEventListener('afterprint', handleAfterPrint);

      return () => {
        clearTimeout(printTimer);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [loading, results]);

  // Sort and group results
  // Sorted by: Class (Alphabetical) -> Roll Number (Ascending)
  const sortedResults = [...results].sort((a, b) => {
    const classCompare = (a.studentClass || '').localeCompare(b.studentClass || '');
    if (classCompare !== 0) return classCompare;
    return (a.studentAbsen || 0) - (b.studentAbsen || 0);
  });

  // Group by class name
  const groupedResults: Record<string, any[]> = {};
  sortedResults.forEach((record) => {
    const cls = record.studentClass || 'Tidak Diketahui';
    if (!groupedResults[cls]) {
      groupedResults[cls] = [];
    }
    groupedResults[cls].push(record);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-brand-600 font-bold">
          <div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Menyiapkan Dokumen PDF...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 font-sans text-slate-800">

      {/* Print Document Header */}
      <div className="text-center space-y-2 mb-10 pb-6 border-b-2 border-slate-300">
        <h1 className="text-2xl font-black font-display text-slate-900 tracking-wide uppercase">
          REKAPITULASI HASIL UJIAN SISWA
        </h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          SMKN 31 JAKARTA • TAHUN AJARAN 2025/2026
        </p>
        <p className="text-xs text-slate-400">
          Mata Pelajaran: Matematika XI • Tanggal Ekspor: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Render tables grouped per class */}
      {Object.keys(groupedResults).length === 0 ? (
        <div className="text-center py-12 text-slate-400 border border-dashed rounded-2xl">
          Belum ada data hasil ujian siswa yang masuk.
        </div>
      ) : (
        Object.entries(groupedResults).map(([className, records]) => (
          <div key={className} className="mb-12 last:mb-0 avoid-break-inside">
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-lg font-extrabold text-slate-900 font-display border-l-4 border-brand-500 pl-2.5">
                Kelas: {className}
              </h2>
              <span className="text-xs font-semibold text-slate-450 uppercase">
                Total: {records.length} Siswa
              </span>
            </div>

            <table className="w-full text-sm border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="border border-slate-300 px-3 py-3 text-center font-bold w-16">Absen</th>
                  <th className="border border-slate-300 px-4 py-3 text-left font-bold">Nama Lengkap</th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-bold w-36">Pasangkan (Benar)</th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-bold w-32">PG / PGK (Benar)</th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-bold w-40">Essay / Uraian</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const matchingCorrect = r.answers
                    ?.filter((a: any) => a.questionType === 'matching')
                    .reduce((sum: number, a: any) => sum + (a.pointsEarned || 0), 0) || 0;

                  const pgCorrect = r.answers
                    ?.filter((a: any) => a.questionType === 'multiple_choice' || a.questionType === 'multiple_response')
                    .reduce((sum: number, a: any) => sum + (a.pointsEarned || 0), 0) || 0;

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="border border-slate-300 px-3 py-3 text-center font-bold text-slate-600">
                        {r.studentAbsen}
                      </td>
                      <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-800">
                        {r.studentName}
                      </td>
                      <td className="border border-slate-300 px-3 py-3 text-center font-bold text-slate-700">
                        {matchingCorrect} / 8
                      </td>
                      <td className="border border-slate-300 px-3 py-3 text-center font-bold text-slate-700">
                        {pgCorrect} / 12
                      </td>
                      {/* Left blank for manual grading as requested */}
                      <td className="border border-slate-300 px-3 py-3 text-center bg-slate-50/10"></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Print styles to ensure tables page-break nicely */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .avoid-break-inside {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
