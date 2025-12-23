
import React from 'react';

const TEAM = [
  {
    name: "Paradox Overlord",
    role: "Creator • Senior Engineer • Frontend Lead • Architect",
    img: String(process.env.DEV_PARADOX_IMG || ""),
    tier: "creator"
  },
  { 
    name: "Feranmi", 
    role: "Creator • Backend Lead • Database Management", 
    img: String(process.env.DEV_FERANMI_IMG || ""),
    tier: "creator"
  },
  { 
    name: "Eddyrus", 
    role: "Course Representative", 
    img: String(process.env.DEV_EDDYRUS_IMG || ""),
    tier: "contributor"
  },
  { 
    name: "Sage", 
    role: "Overview & thoughts", 
    img: String(process.env.DEV_SAGE_IMG || ""),
    tier: "contributor"
  },
  { 
    name: "Sanbyte Tech", 
    role: "Code Review & Quality Assurance", 
    img: String(process.env.DEV_SANBYTE_IMG || ""),
    tier: "contributor"
  }
];

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32 overflow-hidden">
      {/* Hero Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-block bg-blue-500/10 text-blue-500 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.4em] border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] relative z-10">
          The Genesis Protocols
        </div>
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white relative z-10">GENESIS <span className="text-blue-600">DEVS</span></h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-xl leading-relaxed relative z-10">
          The architectural core from <span className="text-slate-300">Great Ife</span> who engineered the infrastructure for anonymous discourse.
        </p>
      </div>

      {/* Developer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
        {TEAM.map((member, i) => (
          <div 
            key={i} 
            className={`group relative bg-slate-900/40 border transition-all duration-700 rounded-[48px] p-8 text-center hover:-translate-y-4 hover:bg-slate-900/80 hover:shadow-2xl
              ${member.tier === 'creator' ? 'border-blue-500/40 shadow-blue-500/5' : 'border-slate-800'}`}
          >
            {/* Animated Scanning Line */}
            <div className="absolute inset-0 overflow-hidden rounded-[48px] pointer-events-none">
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent absolute top-0 -translate-y-full group-hover:animate-[scan_2s_linear_infinite]" />
            </div>

            {/* Background Glow */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 blur-[60px] rounded-full transition-opacity duration-700 opacity-10 group-hover:opacity-40 
              ${member.tier === 'creator' ? 'bg-blue-500' : 'bg-slate-600'}`} />
            
            {/* Avatar Container */}
            <div className="relative mb-8 mx-auto w-32 h-32">
              <svg className="absolute -inset-4 w-[160px] h-[160px] -ml-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-blue-500/30" />
              </svg>
              
              <div className={`absolute inset-0 rounded-[40px] rotate-6 border-2 border-dashed transition-transform duration-700 group-hover:rotate-45 
                ${member.tier === 'creator' ? 'border-blue-500/30' : 'border-slate-700/50'}`} />
              
              <div className={`absolute inset-0 rounded-[40px] -rotate-3 border border-white/5 bg-slate-800 overflow-hidden shadow-2xl transition-all duration-500 group-hover:rotate-0 group-hover:scale-105`}>
                {member.img ? (
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
                {(!member.img) && (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20 group-hover:opacity-100 transition-opacity bg-slate-950">
                    {member.tier === 'creator' ? '🔱' : '🛡️'}
                  </div>
                )}
              </div>
              
              {member.tier === 'creator' && (
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-[8px] font-black text-white px-2.5 py-1.5 rounded-xl shadow-xl uppercase tracking-widest animate-pulse border border-white/10">
                  CORE
                </div>
              )}
            </div>
            
            <div className="relative z-10 space-y-3">
              <div className="font-black text-white text-lg tracking-tighter uppercase group-hover:text-blue-400 transition-colors duration-500">
                {member.name}
              </div>
              <div className={`text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed min-h-[40px] flex items-center justify-center
                ${member.tier === 'creator' ? 'text-blue-500/80' : 'text-slate-600'}`}>
                {member.role}
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping [animation-delay:0.2s]" />
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping [animation-delay:0.4s]" />
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Specs Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="relative bg-slate-900/50 backdrop-blur-3xl border border-slate-800 p-12 md:p-20 rounded-[80px] shadow-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            <div className="space-y-8 lg:col-span-2">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 relative group cursor-help">
                  <div className="absolute inset-0 bg-white/20 rounded-[32px] scale-0 group-hover:scale-100 transition-transform duration-500" />
                  <svg className="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">ANONYMITY MANIFESTO</h3>
                  <div className="text-blue-500 text-xs font-black uppercase tracking-[0.5em] mt-1">Version 4.0.0 Stable</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 font-medium text-lg leading-relaxed">
                <p>AnonChat Pro is not a social network; it is a communication protocol. We believe that in an age of total surveillance, the right to speak without a face is the highest form of academic freedom.</p>
                <p>Every line of code in the Genesis architecture was written to serve the Great Ife community. No tracking, no permanent logs, and no central identity authority.</p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-10 rounded-[48px] text-center space-y-6 shadow-inner relative group overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Protocol Status</div>
              <div className="text-5xl font-black text-blue-500 italic tracking-tighter group-hover:scale-110 transition-transform duration-500">ENCRYPTED</div>
              <div className="pt-6 border-t border-slate-800/50">
                <div className="flex justify-center gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 h-4 bg-blue-500/20 rounded-full group-hover:bg-blue-500/60 transition-colors" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <div className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] mt-4">Zero-Trace Link Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
