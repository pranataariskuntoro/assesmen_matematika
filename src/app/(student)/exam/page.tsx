'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, AlertTriangle } from 'lucide-react';

export default function ExamInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hardcoded for now. In a real app, you might fetch available sessions.
  const sessionId = "DUMMY_SESSION_ID"; 

  const startExam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }), // In a real flow, user selects session or it's passed
      });
      const data = await res.json();
      
      if (data.success) {
        router.push(`/exam/${data.sessionId}`);
      } else if (data.redirect) {
        router.push(data.redirect);
      } else {
        setError(data.message || 'Gagal memulai ujian');
        setLoading(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Asesmen Matematika XI</h1>
        <p className="text-gray-500 mb-8">SMKN 31 Jakarta - Tahun Ajaran 2025/2026</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-brand-50 p-6 rounded-xl flex items-center">
            <Clock className="w-8 h-8 text-brand-600 mr-4" />
            <div>
              <p className="text-sm text-brand-900 font-medium">Durasi Ujian</p>
              <p className="text-2xl font-bold text-brand-700">90 Menit</p>
            </div>
          </div>
          
          <div className="bg-brand-50 p-6 rounded-xl flex items-center">
            <div className="w-8 h-8 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center font-bold mr-4">25</div>
            <div>
              <p className="text-sm text-brand-900 font-medium">Total Soal</p>
              <p className="text-2xl font-bold text-brand-700">Pilihan Ganda & Essay</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8">
          <h3 className="flex items-center text-red-800 font-bold mb-3">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Perhatian & Aturan Ujian (Sistem Anti-Cheat Aktif)
          </h3>
          <ul className="list-disc list-inside text-red-700 space-y-2 text-sm">
            <li>Dilarang berpindah tab browser, meminimalkan jendela, atau membuka aplikasi lain.</li>
            <li>Dilarang melakukan klik kanan atau copy-paste materi apapun.</li>
            <li>Pelanggaran akan dicatat. Maksimal 3 kali peringatan.</li>
            <li>Pada pelanggaran ke-4, ujian akan <b>dihentikan paksa</b> dan dinyatakan selesai.</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={startExam}
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center text-lg disabled:opacity-50"
        >
          {loading ? 'Memuat...' : (
            <>
              <Play className="w-5 h-5 mr-2 fill-current" />
              Mulai Mengerjakan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
