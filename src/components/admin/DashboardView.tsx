'use client';

import { useState, useEffect } from 'react';
import { Users, FileCheck, AlertCircle, TrendingUp, Calendar, School, ArrowRight, Activity, Clock } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { ScoreDistributionChart, PassFailChart } from '@/components/admin/ScoreChart';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [sessionsCount, setSessionsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResults, resSessions] = await Promise.all([
          fetch('/api/results'),
          fetch('/api/sessions')
        ]);

        const dataResults = await resResults.json();
        const dataSessions = await resSessions.json();

        if (dataResults.success) setResults(dataResults.data);
        if (dataSessions.success) setSessionsCount(dataSessions.data.length);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-brand-500 font-bold">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-wide text-slate-500">Memuat Dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const submittedResults = results.filter(r => r.isSubmitted);
  const totalSubmissions = submittedResults.length;

  const avgScore = totalSubmissions > 0
    ? (submittedResults.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / totalSubmissions).toFixed(1)
    : '0';

  const totalViolations = results.reduce((acc, curr) => acc + (curr.violationCount || 0), 0);

  // Advanced Analytics
  let totalCorrectAnswers = 0;
  let totalQuestionsCount = 0;
  let totalTimeSpent = 0;
  let timeSpentCount = 0;

  submittedResults.forEach(r => {
    if (r.answers && Array.isArray(r.answers)) {
      const correctCount = r.answers.filter((ans: any) => ans.isCorrect).length;
      totalCorrectAnswers += correctCount;
      totalQuestionsCount += r.answers.length;
    }
    if (r.timeSpent) {
      totalTimeSpent += r.timeSpent;
      timeSpentCount++;
    }
  });

  const avgCorrectAnswers = totalSubmissions > 0 && totalQuestionsCount > 0
    ? (totalCorrectAnswers / totalSubmissions).toFixed(1)
    : '0';

  const totalQuestionsPerExam = totalSubmissions > 0 && totalQuestionsCount > 0
    ? Math.round(totalQuestionsCount / totalSubmissions)
    : 25;

  const avgTimeMinutes = timeSpentCount > 0
    ? Math.floor((totalTimeSpent / timeSpentCount) / 60)
    : 0;
  const avgTimeSeconds = timeSpentCount > 0
    ? Math.floor((totalTimeSpent / timeSpentCount) % 60)
    : 0;

  const averageAccuracy = totalQuestionsCount > 0
    ? ((totalCorrectAnswers / totalQuestionsCount) * 100).toFixed(1)
    : '0';

  // Score distribution calculations
  const ranges = [
    { range: '0-44 (E)', count: 0 },
    { range: '45-59 (D)', count: 0 },
    { range: '60-74 (C)', count: 0 },
    { range: '75-89 (B)', count: 0 },
    { range: '90-100 (A)', count: 0 },
  ];

  let passedCount = 0;
  let failedCount = 0;

  submittedResults.forEach(r => {
    const score = r.totalScore || 0;
    if (score >= 90) ranges[4].count++;
    else if (score >= 75) ranges[3].count++;
    else if (score >= 60) ranges[2].count++;
    else if (score >= 45) ranges[1].count++;
    else ranges[0].count++;

    if (score >= 75) passedCount++;
    else failedCount++;
  });

  const passRatePercentage = totalSubmissions > 0
    ? ((passedCount / totalSubmissions) * 100).toFixed(0)
    : '0';

  // Latest 5 submissions
  const latestSubmissions = [...submittedResults]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex justify-between items-center border border-brand-500/20">
        <div className="relative z-10 space-y-3">
          <span className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md inline-flex items-center gap-1.5 border border-white/10">
            <School className="w-3.5 h-3.5 text-accent-300" /> Pusat Kendali Ujian
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">Selamat Datang di Dasbor Asesmen</h1>
          <p className="text-brand-50 max-w-xl text-xs md:text-sm font-medium leading-relaxed">
            Pantau progres ujian siswa, atur bank soal, analisis sebaran nilai, dan kelola integritas ujian secara real-time.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 hidden md:block select-none">
          <Calendar className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Ujian Terkirim"
          value={totalSubmissions}
          icon={FileCheck}
          description="Jumlah formulir masuk"
        />
        <StatCard
          title="Pelanggaran Tercatat"
          value={totalViolations}
          icon={AlertCircle}
          description="Indikasi tab switch / keluar window"
          className={totalViolations > 10 ? 'border-red-200 bg-red-50/20' : ''}
        />
        <StatCard
          title="Total Sesi Ujian"
          value={sessionsCount}
          icon={Calendar}
          description="Sesi ujian aktif & non-aktif"
        />
      </div>

      {/* Visual Analytics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Analytics Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex flex-col justify-between space-y-6 lg:col-span-1">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
              <h3 className="font-display font-extrabold text-slate-800 text-base">Analisis Ketuntasan & Efisiensi</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">Rangkuman performa dan durasi pengerjaan siswa</p>
          </div>

          {totalSubmissions > 0 ? (
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {/* Average correct answers */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Jawaban Benar</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-display font-extrabold text-slate-800">{avgCorrectAnswers}</span>
                    <span className="text-[11px] text-slate-400 font-medium">dari {totalQuestionsPerExam} soal</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalQuestionsPerExam > 0 ? (Number(avgCorrectAnswers) / totalQuestionsPerExam) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Average time spent */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Waktu Rata-rata Ujian</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-display font-extrabold text-slate-800">
                      {avgTimeMinutes > 0 ? `${avgTimeMinutes}m ` : ''}{avgTimeSeconds}s
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">durasi per siswa</span>
                  </div>
                </div>
              </div>

              {/* Overall Accuracy rate */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Akurasi Jawaban Keseluruhan</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-display font-extrabold text-slate-800">{averageAccuracy}%</span>
                    <span className="text-[11px] text-slate-400 font-medium">akurasi rata-rata</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-xs font-semibold">
              Belum ada data pengerjaan
            </div>
          )}
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 flex flex-col lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              <h3 className="font-display font-extrabold text-slate-800 text-base">
                Submission Jawaban Terbaru
              </h3>
            </div>
            <Link href="/results" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
              Lihat Semua <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100/80 overflow-y-auto max-h-[360px] pr-1">
            {latestSubmissions.length === 0 ? (
              <p className="text-slate-400 text-center py-8 text-xs font-medium">Belum ada aktivitas pengerjaan terbaru</p>
            ) : (
              latestSubmissions.map((sub) => (
                <div key={sub._id} className="flex justify-between items-center py-4 text-sm first:pt-0 last:pb-0 hover:bg-slate-50/40 transition-colors px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-850 border border-brand-100 flex items-center justify-center font-bold font-display text-sm">
                      {sub.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{sub.studentName}</p>
                      <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                        {sub.studentClass} • Absen {sub.studentAbsen} • <span className="text-slate-550">{sub.sessionId?.name || 'Sesi Ujian'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-800 text-sm md:text-base">{sub.totalScore} Poin</span>
                    <p className="text-slate-400 text-[10px] font-medium mt-0.5">
                      {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
