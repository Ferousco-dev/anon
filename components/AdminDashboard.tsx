import React, { useState, useMemo, useEffect } from 'react';
import { Message, AppSettings, UserRole, UserProfile } from '../types';

interface AdminDashboardProps {
  messages: Message[];
  profiles: Record<string, UserProfile>;
  onDelete: (id: string) => Promise<void> | void;
  onFlag: (id: string) => Promise<void> | void;
  onMute: (alias: string) => void;
  mutedUsers: string[];
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => Promise<void> | void;
}

type SyncStatus = 'IDLE' | 'UPLINKING' | 'SUCCESS' | 'ERROR';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  messages, 
  profiles,
  onDelete, 
  onFlag, 
  onMute, 
  mutedUsers, 
  settings, 
  onUpdateSettings 
}) => {
  const [confirming, setConfirming] = useState<{ type: 'DELETE' | 'MUTE', id: string, alias?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'USERS' | 'SETTINGS'>('USERS');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('IDLE');
  const [modFeedback, setModFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateLocalSetting = (key: keyof AppSettings, val: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: val }));
    if (syncStatus === 'SUCCESS') setSyncStatus('IDLE');
  };

  const handleCommitChanges = async () => {
    setSyncStatus('UPLINKING');
    try {
      await onUpdateSettings(localSettings);
      setSyncStatus('SUCCESS');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
    } catch (err) {
      setSyncStatus('ERROR');
      setTimeout(() => setSyncStatus('IDLE'), 5000);
    }
  };

  const triggerModFeedback = (msg: string) => {
    setModFeedback(msg);
    setTimeout(() => setModFeedback(null), 2000);
  };

  const userList = useMemo(() => {
    return Object.values(profiles).sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());
  }, [profiles]);

  const hasPendingChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  return (
    <div className="space-y-8 pb-20 relative animate-in fade-in duration-500">
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
        {syncStatus !== 'IDLE' && (
          <div className={`px-6 py-2 rounded-full border shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3
            ${syncStatus === 'UPLINKING' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : ''}
            ${syncStatus === 'SUCCESS' ? 'bg-green-600/20 border-green-500/50 text-green-400' : ''}
            ${syncStatus === 'ERROR' ? 'bg-red-600/20 border-red-500/50 text-red-400' : ''}
          `}>
            {syncStatus === 'UPLINKING' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
            {syncStatus === 'SUCCESS' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            {syncStatus === 'UPLINKING' ? 'Syncing Protocol...' : syncStatus === 'SUCCESS' ? 'Protocol Uplink Verified' : 'Uplink Failure'}
          </div>
        )}
        {modFeedback && (
          <div className="px-6 py-2 bg-slate-900/90 border border-slate-700 text-white rounded-full shadow-2xl animate-in slide-in-from-top-2 font-black text-[10px] uppercase tracking-[0.2em]">
            {modFeedback}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 self-start w-fit">
          <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'USERS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>User Registry</button>
          <button onClick={() => setActiveTab('LOGS')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LOGS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>Activity Logs</button>
          <button onClick={() => setActiveTab('SETTINGS')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SETTINGS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>System Config</button>
        </div>
        
        {activeTab === 'SETTINGS' && hasPendingChanges && (
          <button 
            onClick={handleCommitChanges}
            disabled={syncStatus === 'UPLINKING'}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all animate-pulse"
          >
            Commit System Directives
          </button>
        )}
      </div>

      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
              Global Directives
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Protocol Announcement</label>
                <textarea 
                  value={localSettings.announcement} 
                  onChange={e => updateLocalSetting('announcement', e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm h-20 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium transition-all shadow-inner" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Root Access Pin</label>
                <input 
                  type="text" 
                  value={localSettings.adminPin} 
                  onChange={e => updateLocalSetting('adminPin', e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold transition-all shadow-inner" 
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 blur-3xl rounded-full" />
            <h3 className="text-xs font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
              Financial Uplink
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Target (₦)</label>
                <input type="number" value={localSettings.donationTarget} onChange={e => updateLocalSetting('donationTarget', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 font-bold shadow-inner transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Current (₦)</label>
                <input type="number" value={localSettings.donationCurrent} onChange={e => updateLocalSetting('donationCurrent', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 font-bold shadow-inner transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Receiver Information</label>
              <div className="space-y-3">
                <input type="text" value={localSettings.accountNumber} onChange={e => updateLocalSetting('accountNumber', e.target.value)} placeholder="Account Number" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 font-bold shadow-inner transition-all" />
                <input type="text" value={localSettings.accountName} onChange={e => updateLocalSetting('accountName', e.target.value)} placeholder="Account Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 font-bold shadow-inner transition-all" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden animate-in slide-in-from-bottom-4 shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Historical Identity Registry</h3>
            <span className="text-[10px] font-black text-blue-500">{userList.length} Connected Protocols</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">Credential</th>
                  <th className="px-6 py-4 text-center">Activity</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {userList.map(u => (
                  <tr key={u.alias} className={`hover:bg-slate-900/40 group transition-colors ${u.isWeeklyTop ? 'bg-yellow-500/5' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="font-black text-slate-200 text-sm">@{u.alias}</div>
                        {u.isWeeklyTop && <span className="text-yellow-500 text-xs">★</span>}
                      </div>
                      <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">REP: {u.role === 'ADMIN' ? '∞' : String(u.reputation || 0)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-mono text-[10px] text-slate-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
                        {u.password || 'EXTERNAL'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-blue-500 font-black text-sm">{u.totalTransmissions || 0}</div>
                      <div className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Packets Sent</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                        {u.role === 'ADMIN' ? 'GENESIS ADMIN' : 'CITIZEN'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setConfirming({ type: 'MUTE', id: 'N/A', alias: u.alias })}
                        className={`px-3 py-1.5 rounded-xl border text-[9px] font-black transition-all ${mutedUsers.includes(u.alias) ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/20' : 'border-slate-800 text-slate-600 hover:text-orange-400 hover:border-orange-500/50'}`}
                      >
                        {mutedUsers.includes(u.alias) ? 'RESTORE ACCESS' : 'MUTE PROTOCOL'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden animate-in slide-in-from-bottom-4 shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Transmission Logs</h3>
            <span className="text-[10px] font-black text-blue-500">{messages.length} Active Packets</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">IP</th>
                  <th className="px-6 py-4">Payload</th>
                  <th className="px-6 py-4 text-right">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {messages.map(msg => (
                  <tr key={msg.id} className={`hover:bg-slate-900/40 group transition-colors ${msg.isFlagged ? 'bg-red-500/5' : ''}`}>
                    <td className="px-6 py-5 font-black text-slate-300">
                      @{msg.senderAlias}
                      <span className="block text-[8px] font-black text-slate-600 mt-1 uppercase">{msg.senderRole}</span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-mono italic text-[10px]">{msg.ip || '0.0.0.0'}</td>
                    <td className="px-6 py-5 max-w-xs truncate text-slate-400 font-medium leading-relaxed">{msg.content}</td>
                    <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={async () => {
                          await onFlag(msg.id);
                          triggerModFeedback(msg.isFlagged ? 'Flag Removed' : 'Packet Flagged');
                        }} 
                        className={`px-3 py-1.5 rounded-xl border text-[9px] font-black transition-all ${msg.isFlagged ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'border-slate-800 text-slate-600 hover:text-red-400 hover:border-red-400'}`}
                      >
                        FLAG
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
