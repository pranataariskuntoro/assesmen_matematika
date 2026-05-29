import React from 'react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import { Eye } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ResultRecord {
  id: string;
  studentName: string;
  studentClass: string;
  sessionName: string;
  score: number;
  submittedAt: Date;
  status: 'completed' | 'terminated' | 'grading';
  violationCount: number;
}

interface ResultsTableProps {
  data: ResultRecord[];
  onViewDetails?: (id: string) => void;
}

export function ResultsTable({ data, onViewDetails }: ResultsTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/50">
      <table className="w-full text-[13px] text-left text-slate-500 border-collapse">
        <thead className="text-[10px] text-slate-450 font-bold uppercase tracking-wider bg-slate-50/75 border-b border-slate-100">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">Nama Siswa</th>
            <th scope="col" className="px-6 py-4 font-semibold">Kelas</th>
            <th scope="col" className="px-6 py-4 font-semibold">Ujian</th>
            <th scope="col" className="px-6 py-4 font-semibold text-center">Skor</th>
            <th scope="col" className="px-6 py-4 font-semibold">Status</th>
            <th scope="col" className="px-6 py-4 font-semibold">Waktu Selesai</th>
            <th scope="col" className="px-6 py-4 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                Belum ada data hasil pengerjaan siswa
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="bg-white hover:bg-slate-50/40 transition-colors">
                <td className="px-6 py-4.5 font-semibold text-slate-800 whitespace-nowrap">
                  {row.studentName}
                </td>
                <td className="px-6 py-4.5 font-medium text-slate-600">{row.studentClass}</td>
                <td className="px-6 py-4.5 font-medium text-slate-650 truncate max-w-[200px]" title={row.sessionName}>
                  {row.sessionName}
                </td>
                <td className="px-6 py-4.5 text-center font-display font-black text-brand-800 text-sm">
                  {row.score}
                </td>
                <td className="px-6 py-4.5">
                  {row.status === 'completed' && (
                    <Badge variant="success" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold">Selesai</Badge>
                  )}
                  {row.status === 'terminated' && (
                    <Badge 
                      variant="danger" 
                      title={`${row.violationCount} Pelanggaran`}
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    >
                      Terminasi ({row.violationCount}x)
                    </Badge>
                  )}
                  {row.status === 'grading' && (
                    <Badge variant="warning" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold">Perlu Koreksi</Badge>
                  )}
                </td>
                <td className="px-6 py-4.5 text-slate-400 font-medium">
                  {format(new Date(row.submittedAt), 'dd MMM yyyy, HH:mm')}
                </td>
                <td className="px-6 py-4.5 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewDetails && onViewDetails(row.id)}
                    className="h-8 px-2.5 rounded-lg text-brand-700 hover:text-brand-850 hover:bg-brand-50/60 font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1 text-brand-650" /> Koreksi
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
