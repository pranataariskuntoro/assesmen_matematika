'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsTable, ResultRecord } from '@/components/admin/ResultsTable';
import { Search, Filter, RefreshCw, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Select from '@/components/ui/Select';

export default function ResultsView() {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSession, setFilterSession] = useState('all');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleViewDetails = (id: string) => {
    router.push(`/results/${id}`);
  };

  // Get unique sessions and classes for dropdown filters
  const sessions = Array.from(new Set(results.map(r => r.sessionId?.name || 'Sesi Ujian')));
  const classes = Array.from(new Set(results.map(r => r.studentClass)));

  const classOptions = [
    { value: 'all', label: 'Semua Kelas' },
    ...classes.filter(Boolean).map(c => ({ value: c, label: c }))
  ];

  const sessionOptions = [
    { value: 'all', label: 'Semua Sesi' },
    ...sessions.filter(Boolean).map(s => ({ value: s, label: s }))
  ];

  // Filter rows
  const filteredRecords: ResultRecord[] = results
    .filter(r => {
      const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClass === 'all' || r.studentClass === filterClass;
      const matchesSession = filterSession === 'all' || (r.sessionId?.name || 'Sesi Ujian') === filterSession;
      return matchesSearch && matchesClass && matchesSession;
    })
    .map(r => {
      // Find if there are ungraded essay questions
      const hasUngradedEssay = r.answers?.some((ans: any) => 
        ans.questionType === 'essay' && (ans.pointsEarned === undefined || ans.pointsEarned === null)
      );

      let status: 'completed' | 'terminated' | 'grading' = 'completed';
      if (r.isTerminated) status = 'terminated';
      else if (hasUngradedEssay) status = 'grading';

      return {
        id: r._id,
        studentName: r.studentName,
        studentClass: r.studentClass,
        sessionName: r.sessionId?.name || 'Sesi Ujian',
        score: r.totalScore,
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(r.startedAt),
        status,
        violationCount: r.violationCount || 0
      };
    });

  const handleDownloadPDF = () => {
    // Check if iframe already exists
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.remove();
    }
    
    // Create new hidden iframe
    iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.src = '/results/print';
    iframe.style.position = 'fixed';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    
    document.body.appendChild(iframe);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-[72px] z-20 bg-[#F8FAF8]/95 backdrop-blur-md -mx-6 md:-mx-8 px-6 md:px-8 py-4.5 -mt-6 md:-mt-8 border-b border-slate-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-display font-extrabold text-slate-800">Hasil Ujian Siswa</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Lihat lembar jawaban siswa, skor objektif, serta penilaian manual essay.</p>
        </div>
        <div className="flex gap-2.5 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial gap-2 text-brand-700 hover:bg-brand-50 border-brand-200 cursor-pointer h-10 rounded-xl font-semibold"
          >
            <FileText className="w-4 h-4 text-brand-600" /> Rekap PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchResults} 
            className="gap-2 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Segarkan
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/50">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all duration-200 placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 items-center flex-1">
          <Select
            value={filterClass}
            onChange={setFilterClass}
            options={classOptions}
            placeholder="Pilih Kelas"
            icon={<Filter className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="flex gap-2 items-center flex-1">
          <Select
            value={filterSession}
            onChange={setFilterSession}
            options={sessionOptions}
            placeholder="Pilih Sesi"
            icon={<Filter className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          <ResultsTable data={filteredRecords} onViewDetails={handleViewDetails} />
        </div>
      )}
    </div>
  );
}
