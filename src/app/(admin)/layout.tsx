'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileQuestion, Calendar, ClipboardList, LogOut, Menu, X, User } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bank Soal', href: '/questions', icon: FileQuestion },
    { name: 'Sesi Ujian', href: '/sessions', icon: Calendar },
    { name: 'Hasil Ujian', href: '/results', icon: ClipboardList },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex font-sans antialiased text-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-66 bg-white/95 backdrop-blur-md border-r border-slate-200/60 transform transition-all duration-300 ease-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen flex flex-col ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md shadow-brand-400/20 group-hover:scale-105 transition-transform duration-200">
              31
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-display font-extrabold tracking-tight text-slate-800 leading-none">
                Asesmen SMKN 31
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                Portal Admin
              </span>
            </div>
          </Link>
          <button 
            className="lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-[14px] font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50/70 text-brand-800 shadow-[inset_4px_0_0_0_#789d8e] font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 mr-3 transition-transform duration-200 ${isActive ? 'text-brand-600 scale-105' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-[14px] font-medium text-red-600 hover:text-red-700 rounded-xl hover:bg-red-55/40 transition-colors duration-200"
          >
            <LogOut className="w-4.5 h-4.5 mr-3 text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-18 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center px-6 justify-between lg:justify-end sticky top-0 z-30">
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-50 p-2 rounded-xl transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selamat Datang</span>
              <span className="text-sm font-bold text-slate-700">Administrator</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/50 flex items-center justify-center text-brand-700 shadow-inner">
              <User className="w-4.5 h-4.5" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
