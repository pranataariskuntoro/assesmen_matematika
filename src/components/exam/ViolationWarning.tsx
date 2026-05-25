'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ViolationWarningProps {
  count: number;
  remaining: number;
  onUnderstand: () => void;
  isTerminated: boolean;
}

export default function ViolationWarning({ count, remaining, onUnderstand, isTerminated }: ViolationWarningProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-4 rounded-full mb-6 animate-pulse-red">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
            {isTerminated ? "Ujian Dinyatakan Selesai" : "Peringatan Pelanggaran!"}
          </h2>
          
          <p className="text-gray-600 mb-6 font-sans">
            {isTerminated 
              ? "Kamu telah melanggar batas maksimal meninggalkan halaman ujian. Ujianmu otomatis dikirim dan dinyatakan selesai."
              : `Kamu terdeteksi keluar dari halaman ujian atau melakukan aktivitas terlarang. Ini adalah peringatan ke-${count}. Tersisa ${remaining} kali peringatan sebelum ujian otomatis dihentikan.`}
          </p>

          {!isTerminated && (
            <button
              onClick={onUnderstand}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-600/30"
            >
              Saya Mengerti & Tidak Akan Mengulangi
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
