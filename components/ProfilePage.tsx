import React, { useState } from 'react';
import { UserProfile, SocialPost, Message } from '../types';

interface ProfilePageProps {
  profile: UserProfile;
  viewerAlias: string;
  onFollow: (alias: string) => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<void>;
  userPosts: SocialPost[];
  userMessages: Message[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  profile, 
  viewerAlias, 
  onFollow, 
  onUpdateProfile,
  userPosts, 
  userMessages 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(profile.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOwnProfile = profile.alias === viewerAlias;
  const isFollowing = (profile.followers || []).includes(viewerAlias);
  const isAdmin = profile.role === 'ADMIN';
  const isWinner = profile.isWeeklyTop;

  const stats = [
    { label: 'Reputation', value: isAdmin ? '∞' : (profile.reputation || 0), color: 'text-blue-500' },
    { label: 'Followers', value: (profile.followers || []).length, color: 'text-green-500' },
    { label: 'Transmissions', value: profile.totalTransmissions || 0, color: 'text-orange-500' },
    { label: 'Likes', value: profile.totalLikesReceived || 0, color: 'text-red-500' },
  ];

  const handleSave = async () => {
    if (!onUpdateProfile) return;
    setIsSaving(true);
    try {
      await onUpdateProfile({ bio: newBio });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      {/* Toast Success */}
      {saveSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4">
          Identity Updated Successfully
        </div>
      )}

      {/* Profile Header */}
      <div className={`bg-slate-900 border p-8 rounded-[48px] shadow-2xl relative overflow-hidden text-white transition-all duration-700 ${isWinner ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' : 'border-slate-800'}`}>
        
        {isWinner && (
          <div className="absolute top-0 right-0 p-4 animate-pulse">
            <div className="bg-yellow-500 text-slate-950 font-black px-4 py-1.5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
              <span className="text-lg">★</span> WEEKLY VANGUARD
            </div>
          </div>
        )}

        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-5xl font-black text-white shadow-2xl shrink-0 transition-all duration-700 ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-orange-600 scale-105 shadow-yellow-500/20' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
            {profile.alias[0].toUpperCase()}
            {isWinner && <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-yellow-500 rounded-full flex items-center justify-center text-2xl shadow-xl border-4 border-slate-900 animate-bounce">★</div>}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-4xl font-black tracking-tighter text-white">@{String(profile.alias)}</h2>
                {isWinner && (
                   <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-lg" title="Weekly Winner Badge">
                     ✓
                   </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {isAdmin && (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Verified Admin
                  </span>
                )}
                {isWinner && (
                  <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Elite Citizen
                  </span>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <textarea 
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                  placeholder="Tell the network something about yourself..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500/50 min-h-[100px] resize-none transition-all text-slate-200"
                  maxLength={160}
                />
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => { setIsEditing(false); setNewBio(profile.bio || ''); }} 
                    className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    {isSaving ? 'Synching...' : 'Commit Updates'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-medium max-w-md italic leading-relaxed">
                {String(profile.bio || "This user is keeping a low profile in the Great Ife network.")}
              </p>
            )}

            {!isEditing && (
              <div className="pt-2">
                {isOwnProfile ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-700 hover:text-white transition-all active:scale-95 shadow-lg"
                  >
                    Modify Protocol Identity
                  </button>
                ) : (
                  <button 
                    onClick={() => onFollow(profile.alias)}
                    className={`px-8 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl ${
                      isFollowing 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
                    }`}
                  >
                    {isFollowing ? 'UNFOLLOW' : 'FOLLOW ALIAS'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/50">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left group cursor-default">
              <div className={`text-2xl font-black transition-transform group-hover:scale-110 origin-left ${stat.color}`}>{String(stat.value)}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Recent Transmissions
          </h3>
          <div className="space-y-3">
            {userMessages.slice(0, 5).map(msg => (
              <div key={msg.id} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-[32px] hover:border-slate-700 transition-colors shadow-sm group">
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed group-hover:text-slate-100 transition-colors">{String(msg.content)}</p>
                <div className="mt-3 text-[9px] text-slate-600 font-bold uppercase tracking-widest">{new Date(msg.timestamp).toLocaleDateString()}</div>
              </div>
            ))}
            {userMessages.length === 0 && <div className="text-center py-16 bg-slate-900/20 rounded-[32px] border border-dashed border-slate-800 text-slate-800 font-black uppercase tracking-widest text-[10px]">No packets found</div>}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            Social Echoes
          </h3>
          <div className="space-y-3">
            {userPosts.slice(0, 5).map(post => (
              <div key={post.id} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-[32px] hover:border-slate-700 transition-colors shadow-sm group">
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed group-hover:text-slate-100 transition-colors">{String(post.content)}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{new Date(post.timestamp).toLocaleDateString()}</span>
                  <span className="text-[9px] text-red-500 font-black bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 group-hover:bg-red-500/20 transition-colors">♥ {(post.likes || []).length}</span>
                </div>
              </div>
            ))}
            {userPosts.length === 0 && <div className="text-center py-16 bg-slate-900/20 rounded-[32px] border border-dashed border-slate-800 text-slate-800 font-black uppercase tracking-widest text-[10px]">No social activity</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
