
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { generateCampusAlias } from '../paradoxRandoms';
import { supabase } from '../supabaseClient';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
  currentPin: string;
}

const OAU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Obafemi_Awolowo_University_logo.png/200px-Obafemi_Awolowo_University_logo.png";
const NACOS_LOGO = "https://raw.githubusercontent.com/Paradox-Overlord/Assets/main/nacos_logo_white.png";

const Auth: React.FC<AuthProps> = ({ onLogin, currentPin }) => {
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordMetrics = useMemo(() => {
    if (password.length === 0) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length < 6) return { score: 0.5, label: 'Invalid (Min 6)', color: 'bg-red-500' };
    if (score <= 2) return { score: 1, label: 'Weak Protocol', color: 'bg-orange-500' };
    if (score <= 4) return { score: 2, label: 'Fair Security', color: 'bg-yellow-500' };
    return { score: 3, label: 'Binary-Shield Active', color: 'bg-green-500' };
  }, [password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || password.length < 6) {
      setError('Alias is required and password must be 6+ characters');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const cleanAlias = alias.trim();
      const isAdmin = adminKey === currentPin;
      
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('alias', cleanAlias)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingUser) {
        if (existingUser.password === password) {
          const userObj = { ...existingUser, joinedAt: new Date(existingUser.joinedAt) };
          onLogin(userObj);
          localStorage.setItem('anonpro_session', JSON.stringify({ alias: existingUser.alias, password: existingUser.password }));
        } else {
          setError('Access Denied: Identifier Collision Detected');
        }
      } else {
        // Fix: Added missing required property totalTransmissions to satisfy UserProfile interface
        const newUser: UserProfile = {
          alias: cleanAlias,
          password: password,
          role: isAdmin ? 'ADMIN' : 'USER',
          joinedAt: new Date(),
          reputation: 10,
          followers: [],
          following: [],
          totalLikesReceived: 0,
          bio: '',
          totalTransmissions: 0
        };
        
        await supabase.from('profiles').insert(newUser);
        onLogin(newUser);
        localStorage.setItem('anonpro_session', JSON.stringify({ alias: newUser.alias, password: newUser.password }));
      }
    } catch (err: any) {
      setError(err.message || 'Transmission Failed. Check Uplink.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAlias = async () => {
    setIsGenerating(true);
    try {
      const newAlias = await generateCampusAlias();
      setAlias(newAlias);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background SVG Animations */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.2" />
            </pattern>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          <circle cx="20" cy="30" r="1.5" fill="url(#glow)">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="4s" repeatCount="indefinite" />
            <animate attributeName="cy" values="30;35;30" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="70" r="2" fill="url(#glow)">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="6s" repeatCount="indefinite" />
            <animate attributeName="cx" values="80;75;80" dur="10s" repeatCount="indefinite" />
          </circle>
          
          <rect width="100" height="0.1" fill="rgba(59, 130, 246, 0.1)">
            <animate attributeName="y" values="-10;110" dur="12s" repeatCount="indefinite" />
          </rect>
        </svg>
      </div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[48px] border border-slate-800 shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        
        <div className="text-center relative z-10">
          <div className="flex justify-center gap-6 mb-8 items-center">
             <img src={OAU_LOGO} alt="OAU" className="h-14 w-auto brightness-90 contrast-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
             <div className="w-[1px] h-10 bg-slate-800" />
             <img src={NACOS_LOGO} alt="NACOS" className="h-14 w-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic group">
            ANON<span className="text-blue-500 transition-all duration-500 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">PRO</span>
          </h2>
          <p className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Identity Encryption Active</p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleLogin}>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Identity Alias</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all shadow-inner"
                  placeholder="e.g. GhostScribe24"
                />
                <button
                  type="button"
                  onClick={handleGenerateAlias}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 transition-colors bg-slate-900/50 rounded-xl"
                  title="Generate Random Alias"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Access Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all shadow-inner pr-14"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors bg-slate-900/50 rounded-xl"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-2 ml-4 flex items-center justify-between">
                <div className="flex gap-1 h-1 flex-1 max-w-[120px]">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${passwordMetrics.score > i ? passwordMetrics.color : 'bg-slate-800'}`} />
                  ))}
                </div>
                <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{passwordMetrics.label}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Genesis Key (Optional)</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all shadow-inner"
                placeholder="Admin verification"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden group/btn bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[24px] transition-all shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Establishing Link...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Initiate Handshake</span>
              </>
            )}
            
            <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/20 skew-x-[-25deg] group-hover/btn:left-[150%] transition-all duration-1000 ease-in-out" />
          </button>
        </form>

        <p className="mt-8 text-center text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em]">
          End-to-End Encrypted Tunnel Active
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default Auth;
