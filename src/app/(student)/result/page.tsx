'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  
  // In a real app, you would fetch the latest submitted result for the student from an API route.
  // We'll mock a fetch just for visual completeness, assuming we'd hit `/api/exam/result`
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-xl w-full p-8 text-center border-t-8 border-brand-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Ujian Selesai!</h1>
        <p className="text-gray-600 mb-8 font-medium">Jawabanmu telah berhasil dikirim dan direkam oleh sistem.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Informasi Hasil</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex justify-between">
              <span>Status Pengerjaan:</span>
              <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Terkirim Sempurna</span>
            </li>
            <li className="flex justify-between">
              <span>Penilaian Essay:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Menunggu Guru</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            // Need to logout or go to dashboard
            router.push('/');
          }}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
