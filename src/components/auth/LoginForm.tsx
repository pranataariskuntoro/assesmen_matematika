'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  School, 
  Calculator, 
  Ruler, 
  Compass, 
  GraduationCap, 
  Brain, 
  Award,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const router = useRouter();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password, role: 'admin' }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login admin gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-x-hidden font-sans">
      
      {/* Floating Decorative School/Math Icons */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-[0.05]">
        <div className="absolute top-[10%] left-[8%] animate-bounce [animation-duration:10s]">
          <Calculator className="w-20 h-20 text-brand-400 rotate-12" />
        </div>
        <div className="absolute top-[20%] right-[10%] animate-pulse [animation-duration:8s]">
          <Compass className="w-24 h-24 text-brand-500 -rotate-12" />
        </div>
        <div className="absolute bottom-[18%] left-[8%] animate-pulse [animation-duration:12s]">
          <Ruler className="w-20 h-20 text-brand-400 rotate-45" />
        </div>
        <div className="absolute bottom-[10%] right-[10%] animate-bounce [animation-duration:15s]">
          <GraduationCap className="w-28 h-28 text-brand-500 -rotate-12" />
        </div>
        <div className="absolute top-[48%] right-[4%] opacity-60">
          <Brain className="w-14 h-14 text-brand-400 rotate-6" />
        </div>
        <div className="absolute bottom-[48%] left-[4%] opacity-60">
          <Award className="w-16 h-16 text-accent-500 -rotate-6" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-brand-400 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-2xl font-display mb-4 shadow-md shadow-brand-500/10"
        >
          31
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 font-display">
            Portal Admin Asesmen
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-450 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <School className="w-3.5 h-3.5" /> SMKN 31 Jakarta
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white py-8 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:rounded-2xl sm:px-10 border border-slate-200/40"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" />
                Email Admin
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-400/10 outline-none text-slate-800 transition-all font-medium text-sm shadow-inner placeholder:text-slate-400"
                  placeholder="admin@smkn31.sch.id"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-400" />
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-400/10 outline-none text-slate-800 transition-all font-medium text-sm shadow-inner placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-accent-750 text-xs bg-accent-50 p-3.5 rounded-xl border border-accent-100 text-center font-bold"
              >
                {error}
              </motion.div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-brand-500/10 text-sm font-bold text-white bg-brand-400 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </div>
                ) : (
                  'Masuk Portal Admin'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex justify-center">
            <button 
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Siswa
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
