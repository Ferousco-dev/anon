
import React from 'react';
import { AppSettings } from '../types';

interface DonationPageProps {
  settings: AppSettings;
}

const DonationPage: React.FC<DonationPageProps> = ({ settings }) => {
  const percent = Math.min(100, (settings.donationCurrent / settings.donationTarget) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-600/10 rounded-[32px] mx-auto flex items-center justify-center text-green-500 text-4xl mb-6 shadow-2xl shadow-green-600/20">₦</div>
        <h2 className="text-4xl font-black tracking-tighter">SERVER <span className="text-green-500">SUPPORT</span></h2>
        <p className="text-slate-500 font-medium">Help us keep the servers running and the leaks flowing. 100% of donations go to hosting costs.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 text-green-500/10 font-black text-8xl pointer-events-none italic">FUND</div>
        
        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Current Progress</div>
              <div className="text-4xl font-black text-white">₦{settings.donationCurrent.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Goal</div>
              <div className="text-2xl font-black text-slate-400">₦{settings.donationTarget.toLocaleString()}</div>
            </div>
          </div>

          <div className="h-6 w-full bg-slate-950 rounded-full border border-slate-800 p-1">
            <div 
              className="h-full bg-gradient-to-r from-green-600 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl space-y-4 mt-10">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Bank Transfer Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Account:</span>
                <span className="text-white font-black">{settings.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Name:</span>
                <span className="text-white font-black">{settings.accountName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-[0.3em]">Thank you for supporting AnonPro</p>
    </div>
  );
};

export default DonationPage;
