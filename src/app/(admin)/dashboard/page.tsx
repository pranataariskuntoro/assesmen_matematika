'use client';

import { Users, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  // Placeholder data. In real app, fetch from API.
  const stats = [
    { title: 'Total Peserta', value: '200', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Sudah Mengerjakan', value: '185', icon: FileCheck, color: 'bg-green-50 text-green-600' },
    { title: 'Rata-rata Nilai', value: '78.5', icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Pelanggaran Hari Ini', value: '12', icon: AlertCircle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-gray-900 mb-6">Dashboard Ringkasan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
              <div className={`p-4 rounded-xl mr-4 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-96 flex items-center justify-center">
          <p className="text-gray-400">[Area Grafik Distribusi Nilai - Recharts]</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-96 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Submission Terbaru</h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-900">Siswa {i}</p>
                  <p className="text-gray-500 text-xs">XI TKJ 1</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">85 Poin</p>
                  <p className="text-gray-400 text-xs">10 menit lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
