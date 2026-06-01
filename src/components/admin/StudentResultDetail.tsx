'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, X, ShieldAlert, Clock, Award, AlertTriangle, ArrowLeft, Send, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentResultDetail() {
  const { studentId } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Essay scoring input states: maps questionId to points
  const [essayScores, setEssayScores] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchResultDetail = async () => {
    try {
      const res = await fetch(`/api/results/${studentId}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        
        // Initialize essay scores state
        const scores: Record<string, number> = {};
        result.data.answers.forEach((ans: any) => {
          if (ans.questionType === 'essay') {
            scores[ans.questionId._id] = ans.pointsEarned !== null ? ans.pointsEarned : 0;
          }
        });
        setEssayScores(scores);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchResultDetail();
    }
  }, [studentId]);

  const handleScoreChange = (qId: string, val: number) => {
    setEssayScores(prev => ({ ...prev, [qId]: val }));
  };

  const saveEssayScore = async (qId: string) => {
    setSavingId(qId);
    try {
      const res = await fetch(`/api/results/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: qId,
          pointsEarned: essayScores[qId],
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        alert('Nilai essay berhasil disimpan!');
        fetchResultDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4">
        <p className="text-slate-450 font-medium text-sm">Data hasil pengerjaan tidak ditemukan.</p>
        <Button onClick={() => router.push('/results')} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md h-10 px-4">
          Kembali ke Daftar Hasil
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="sticky top-[72px] z-20 bg-[#F8FAF8]/95 backdrop-blur-md -mx-6 md:-mx-8 px-6 md:px-8 py-4.5 -mt-6 md:-mt-8 border-b border-slate-200/40 flex items-center gap-3 transition-all duration-200">
        <Button 
          variant="outline" 
          onClick={() => router.push('/results')} 
          className="h-10 w-10 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 bg-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-800">Lembar Hasil Ujian</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Lembar koreksi & audit ujian siswa {data.studentName}</p>
        </div>
      </div>

      {/* Main Student Card Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm">
        
        {/* Left Column: Student info */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identitas Peserta</h3>
          <div className="space-y-1.5">
            <h2 className="text-lg font-display font-extrabold text-slate-800 leading-tight">{data.studentName}</h2>
            <p className="text-xs text-slate-500 font-medium">Kelas: <strong className="text-slate-800 font-semibold">{data.studentClass}</strong></p>
            <p className="text-xs text-slate-500 font-medium">Nomor Absen: <strong className="text-slate-800 font-semibold">{data.studentAbsen}</strong></p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Mulai: {format(new Date(data.startedAt), 'dd MMM yyyy, HH:mm:ss')}
          </p>
        </div>

        {/* Center Column: Exam & anti-cheat info */}
        <div className="space-y-4 border-y md:border-y-0 md:border-x border-slate-100 py-4 md:py-0 md:px-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Sesi & Integritas</h3>
          <div className="space-y-2">
            <p className="text-sm text-slate-700 font-semibold truncate" title={data.sessionId?.name}>{data.sessionId?.name || 'Sesi Ujian'}</p>
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> 
                Durasi pengerjaan: {data.timeSpent ? `${Math.floor(data.timeSpent / 60)}m ${Math.floor(data.timeSpent % 60)}s` : '-'}
              </p>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                Jumlah pelanggaran: 
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${data.violationCount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {data.violationCount} kali
                </span>
              </p>
            </div>
          </div>
          {data.isTerminated && (
            <Badge variant="danger" className="gap-1.5 rounded-full font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> Diterminasi Sistem
            </Badge>
          )}
        </div>

        {/* Right Column: Score & Grade summary */}
        <div className="flex flex-col items-center justify-center bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-center">
          <Award className="w-8 h-8 text-brand-600 mb-2" />
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Akhir</h4>
          <h2 className="text-3xl font-display font-black text-brand-850 mt-1">{data.totalScore} <span className="text-[11px] text-slate-400 font-bold">/{data.maxScore || 100} Pts</span></h2>
          <Badge variant={data.totalScore >= 75 ? 'success' : 'danger'} className="mt-2 text-xs py-0.5 px-3 rounded-full font-bold">
            Predikat {data.grade || 'E'}
          </Badge>
        </div>

      </div>

      {/* Answer lists */}
      <div className="space-y-6">
        <h3 className="text-base font-display font-extrabold text-slate-800 border-b border-slate-100 pb-2">Lembar Jawaban Siswa</h3>
        
        {data.answers.length === 0 ? (
          <p className="text-slate-450 text-xs font-medium text-center py-6">Siswa belum menjawab pertanyaan apapun.</p>
        ) : (
          data.answers.map((ans: any) => {
            const isEssay = ans.questionType === 'essay';
            const isCorrect = ans.isCorrect;
            const qData = ans.questionId;

            return (
              <div key={ans._id} className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6 space-y-4 hover:shadow-md transition-all duration-300">
                
                {/* Header question status */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      No. {ans.questionNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tipe: {ans.questionType === 'multiple_choice' ? 'Pilihan Ganda' : ans.questionType === 'multiple_response' ? 'Kompleks' : ans.questionType === 'matching' ? 'Menjodohkan' : 'Essay'}</span>
                  </div>
                  
                  {/* Status indicators */}
                  {!isEssay ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      {isCorrect ? (
                        <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Benar (+{ans.pointsEarned} Pts)
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-500" /> Salah (+0 Pts)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                      Skor Essay: {ans.pointsEarned !== null ? `${ans.pointsEarned} / 10 Pts` : 'Belum Dinilai'}
                    </div>
                  )}
                </div>

                {/* Question Text */}
                {qData && (
                  <div className="text-slate-800 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                    {qData.questionText.split(/(\/image\/[^\s\n]+\.(?:png|jpg|jpeg|gif))/gi).map((part: string, idx: number) => {
                      if (part.startsWith('/') && /\.(?:png|jpg|jpeg|gif)$/i.test(part)) {
                        return (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 my-4 max-w-xs bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={part} alt="Gambar Soal" className="w-full mx-auto h-auto object-contain" />
                          </div>
                        );
                      }
                      return <span key={idx}>{part}</span>;
                    })}
                  </div>
                )}

                {/* Question Image if any */}
                {qData?.imageUrl && (
                  <div className="max-w-md border border-slate-200 rounded-xl overflow-hidden p-1.5 bg-slate-50/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qData.imageUrl} alt="Gambar Soal" className="object-contain max-h-40 rounded-lg mx-auto" />
                  </div>
                )}

                {/* Student's answer content */}
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jawaban Siswa:</span>
                  
                  {ans.questionType === 'matching' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                      {Object.keys(ans.studentAnswer || {}).map((idxKey) => {
                        const matchedAns = ans.studentAnswer[idxKey];
                        const statement = qData?.matchingPairs?.[Number(idxKey)]?.statement || `Pernyataan ${Number(idxKey) + 1}`;
                        const keyCorrect = qData?.correctAnswer?.[idxKey];
                        const isMatchCorrect = matchedAns?.trim().toUpperCase() === keyCorrect?.trim().toUpperCase();

                        return (
                          <div key={idxKey} className="p-2.5 border border-slate-200/50 bg-white rounded-lg flex justify-between items-center gap-3">
                            <span className="truncate max-w-[200px] text-slate-700"><strong>{Number(idxKey) + 1}.</strong> {statement}</span>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${isMatchCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-750'}`}>
                              Pilih: {matchedAns || 'Kosong'} (Kunci: {keyCorrect})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : ans.questionType === 'multiple_choice' || ans.questionType === 'multiple_response' ? (
                    <div className="space-y-2 text-sm font-semibold">
                      {/* Find the option text for student's answer */}
                      {(() => {
                        const studentKey = ans.studentAnswer;
                        const correctKey = qData?.correctAnswer;
                        const optionMap: Record<string, string> = {};
                        (qData?.options || []).forEach((o: any) => { optionMap[o.key] = o.text; });
                        const studentOptText = studentKey ? optionMap[studentKey] : null;
                        const correctOptText = correctKey ? optionMap[correctKey] : null;
                        const isImg = (t: string) => t?.startsWith('/image');
                        return (
                          <>
                            <div className="flex items-start gap-2">
                              <span className="text-slate-500 shrink-0 text-xs">Jawaban Siswa:</span>
                              {studentOptText ? (
                                isImg(studentOptText) ? (
                                  <img src={studentOptText} alt={`Pilihan ${studentKey}`} className="max-h-14 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-sm" />
                                ) : (
                                  <span className="text-slate-800">{studentKey} — {studentOptText}</span>
                                )
                              ) : (
                                <span className="text-slate-400 italic">{studentKey || 'Tidak dijawab'}</span>
                              )}
                            </div>
                            {correctKey && (
                              <div className="flex items-start gap-2">
                                <span className="text-slate-400 shrink-0 text-xs">Kunci Jawaban:</span>
                                {correctOptText ? (
                                  isImg(correctOptText) ? (
                                    <img src={correctOptText} alt={`Kunci ${correctKey}`} className="max-h-14 object-contain rounded-lg border border-green-200 bg-green-50 p-1 shadow-sm" />
                                  ) : (
                                    <span className="text-xs font-semibold text-slate-400">{correctKey} — {correctOptText}</span>
                                  )
                                ) : (
                                  <span className="text-xs font-semibold text-slate-400">{correctKey}</span>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Essay block */
                    <div className="bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed font-sans text-slate-700 text-sm whitespace-pre-wrap">
                      {ans.studentAnswer || '(Siswa tidak mengisi jawaban essay)'}
                    </div>
                  )}
                </div>

                {/* Essay score input fields */}
                {isEssay && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 border-t border-slate-100 bg-slate-50/20 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-650">Koreksi Penilaian Guru (Skor 0–10):</span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={essayScores[ans.questionId._id] || 0}
                        onChange={(e) => handleScoreChange(ans.questionId._id, Number(e.target.value))}
                        className="w-16 border border-slate-200 bg-white rounded-lg p-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-black text-brand-850"
                      />
                      <Button
                        size="sm"
                        isLoading={savingId === ans.questionId._id}
                        onClick={() => saveEssayScore(ans.questionId._id)}
                        className="gap-1.5 h-8 bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 text-xs"
                      >
                        <Send className="w-3 h-3" /> Nilai
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
