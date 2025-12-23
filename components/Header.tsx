import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  currentView: string;
  onViewChange: (view: any) => void;
  onSearch: (q: string) => void;
  searchQuery: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, onViewChange, onSearch, searchQuery, onLogout }) => {
  const isAdmin = user.role === 'ADMIN';
  const isWinner = user.isWeeklyTop;
  
  const navItems = [
    { id: 'HOME', label: 'Home' },
    { id: 'CHAT', label: 'Chat' },
    { id: 'SOCIAL', label: 'Social' },
    { id: 'PROFILE', label: 'My Profile' },
    { id: 'DONATE', label: 'Support' },
    { id: 'ABOUT', label: 'About' },
    ...(isAdmin ? [{ id: 'ADMIN', label: 'Admin' }] : [])
  ];

  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 px-4 md:px-8 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewChange('HOME')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic shadow-lg group-hover:scale-110 transition-transform text-white">A</div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-white">ANON<span className="text-blue-500">PRO</span></h1>
          </div>
          <div 
            onClick={() => onViewChange('PROFILE')}
            className={`flex items-center gap-2 bg-slate-900 border py-1.5 px-3 rounded-2xl cursor-pointer hover:border-blue-500/50 transition-all ${isWinner ? 'border-yellow-500/30' : 'border-slate-800'}`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-300">@{String(user.alias)}</span>
              {isWinner && <span className="text-yellow-500 text-[10px] animate-pulse">★</span>}
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${isAdmin ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              REP: {isAdmin ? '∞' : String(user.reputation || 0)}
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full lg:w-auto py-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${currentView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={onLogout}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
          >
            Logout
          </button>
        </nav>

        <div className="relative flex-1 max-w-md w-full">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search packets, @users or #tags..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all placeholder-slate-700 shadow-inner"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
