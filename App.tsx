import React, { useState, useEffect, useRef } from 'react';
import { Message, UserProfile, SocialPost, AppSettings, Comment } from './types';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';
import Composer from './components/Composer';
import Auth from './components/Auth';
import SocialWall from './components/SocialWall';
import AdminDashboard from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import DonationPage from './components/DonationPage';
import ProfilePage from './components/ProfilePage';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const ADMIN_PIN = String(process.env.ADMIN_PIN || 'GREAT_IFE_ADMIN_2025');

const OAU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Obafemi_Awolowo_University_logo.png/200px-Obafemi_Awolowo_University_logo.png";
const NACOS_LOGO = "https://raw.githubusercontent.com/Paradox-Overlord/Assets/main/nacos_logo_white.png";

const DEFAULT_SETTINGS: AppSettings = {
  adminPin: ADMIN_PIN,
  announcement: 'Welcome to AnonPro! Secure, identity-free community platform.',
  donationTarget: 10000,
  donationCurrent: 1250,
  accountName: 'NACOS OAU CHAPTER',
  accountNumber: '0123456789'
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [view, setView] = useState<'CHAT' | 'SOCIAL' | 'ADMIN' | 'HOME' | 'ABOUT' | 'DONATE' | 'PROFILE'>('HOME');
  const [selectedProfileAlias, setSelectedProfileAlias] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [mutedAliases, setMutedAliases] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [seenMessageIds, setSeenMessageIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifySavedSession = async () => {
      const savedSession = localStorage.getItem('anonpro_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.alias && parsed.password) {
            if (isSupabaseConfigured) {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('alias', parsed.alias)
                .single();

              if (!error && data && data.password === parsed.password) {
                setUser({ ...data, joinedAt: new Date(data.joinedAt) });
              } else {
                localStorage.removeItem('anonpro_session');
              }
            } else {
              setUser({ ...parsed, joinedAt: new Date(parsed.joinedAt) });
            }
          }
        } catch (e) {
          localStorage.removeItem('anonpro_session');
        }
      }
      setIsVerifyingSession(false);
    };
    verifySavedSession();
  }, []);

  useEffect(() => {
    const initData = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const [
          { data: msgData },
          { data: postData },
          { data: profileData },
          { data: settingsData }
        ] = await Promise.all([
          supabase.from('messages').select('*').order('timestamp', { ascending: true }),
          supabase.from('posts').select('*').order('timestamp', { ascending: false }),
          supabase.from('profiles').select('*'),
          supabase.from('settings').select('*').single()
        ]);

        if (msgData) setMessages(msgData.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        if (postData) setPosts(postData.map(p => ({ ...p, timestamp: new Date(p.timestamp) })));
        if (profileData) {
          const profMap: Record<string, UserProfile> = {};
          profileData.forEach(p => profMap[p.alias] = { ...p, joinedAt: new Date(p.joinedAt) });
          setProfiles(profMap);
        }
        if (settingsData) setSettings(settingsData);
      } catch (e) {
        console.warn("Uplink failed. Using local state.");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;

    const messageChannel = supabase.channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', table: 'messages' }, payload => {
        const newMessage = { ...payload.new, timestamp: new Date(payload.new.timestamp) } as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    const settingsChannel = supabase.channel('settings-realtime')
      .on('postgres_changes', { event: 'UPDATE', table: 'settings' }, payload => {
        setSettings(payload.new as AppSettings);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [user]);

  const incrementTransmissionCount = async () => {
    if (!user) return;
    const currentCount = user.totalTransmissions || 0;
    const newCount = currentCount + 1;
    
    // Update local user state
    setUser(prev => prev ? { ...prev, totalTransmissions: newCount } : null);
    
    // Update global profiles map
    setProfiles(prev => ({
      ...prev,
      [user.alias]: { ...prev[user.alias], totalTransmissions: newCount }
    }));

    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({ totalTransmissions: newCount })
        .eq('alias', user.alias);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!user || mutedAliases.includes(user.alias)) return;
    
    const now = new Date();
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderAlias: user.alias,
      senderRole: user.role,
      content: String(text),
      timestamp: now,
      tags: (text.match(/#\w+/g) || []).map(t => t.toLowerCase()),
      replyToId: replyTarget?.id,
      ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      isFlagged: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    if (isSupabaseConfigured) {
      await supabase.from('messages').insert({ ...newMessage, timestamp: now.toISOString() });
    }
    
    await incrementTransmissionCount();
    setReplyTarget(null);
  };

  const handleCreatePost = async (content: string, background?: string) => {
    if (!user) return;
    const now = new Date();
    const newPost: SocialPost = {
      id: Math.random().toString(36).substr(2, 9),
      authorAlias: user.alias,
      content,
      background,
      timestamp: now,
      likes: [],
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    if (isSupabaseConfigured) {
      await supabase.from('posts').insert({ ...newPost, timestamp: now.toISOString() });
    }

    await incrementTransmissionCount();
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('settings').upsert(newSettings);
      if (error) throw error;
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    setProfiles(prev => ({
      ...prev,
      [user.alias]: { ...prev[user.alias], ...updates }
    }));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('alias', user.alias);
      if (error) throw error;
    }
  };

  const openProfile = (alias: string) => {
    const cleanAlias = String(alias).startsWith('@') ? alias.slice(1) : alias;
    setSelectedProfileAlias(cleanAlias);
    setView('PROFILE');
  };

  if (isLoading || isVerifyingSession) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <div className="text-slate-500 font-black tracking-widest text-[10px] uppercase">Connecting...</div>
    </div>
  );

  if (!user) return <Auth onLogin={setUser} currentPin={ADMIN_PIN} />;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header 
        user={user} 
        currentView={view} 
        onViewChange={(v) => { if(v === 'PROFILE') openProfile(user.alias); else setView(v); }} 
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onLogout={() => { setUser(null); localStorage.removeItem('anonpro_session'); setView('HOME'); }}
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {view === 'HOME' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-in fade-in duration-1000">
              <div className="flex gap-12 items-center">
                <img src={OAU_LOGO} alt="OAU" className="h-24 md:h-32 w-auto" />
                <img src={NACOS_LOGO} alt="NACOS" className="h-24 md:h-32 w-auto" />
              </div>
              <div className="space-y-4">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase">ANONCHAT <span className="text-blue-500">PRO</span></h2>
                <p className="text-slate-500 max-w-lg mx-auto text-xl font-medium">The Professional Anonymous Network for the Great Ife Community.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <button onClick={() => setView('CHAT')} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl transition-all hover:scale-105">ENTER CHATROOM</button>
                <button onClick={() => setView('SOCIAL')} className="bg-slate-900 border border-slate-800 text-slate-300 px-10 py-5 rounded-3xl font-black text-lg">SOCIAL WALL</button>
              </div>
            </div>
          )}

          {view === 'CHAT' && (
            <div className="space-y-4 pt-4">
              {settings.announcement && (
                <div className="bg-blue-600 border border-white/20 p-4 rounded-2xl mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg></div>
                  <div className="flex-1 font-black text-sm uppercase tracking-tight">{settings.announcement}</div>
                </div>
              )}
              {messages.filter(m => {
                const q = searchQuery.toLowerCase().trim();
                if (!q) return true;
                return m.content.toLowerCase().includes(q) || m.senderAlias.toLowerCase().includes(q);
              }).map((m) => (
                <ChatBubble 
                  key={m.id} message={m} onReply={() => setReplyTarget(m)} onTagClick={setSearchQuery}
                  isReply={!!m.replyToId} parentMessage={messages.find(p => p.id === m.replyToId)}
                  onJumpToParent={(pid) => { document.getElementById(`msg-${pid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                  isUnread={!seenMessageIds.has(m.id)} onSeen={id => setSeenMessageIds(prev => new Set(prev).add(id))} onAliasClick={openProfile}
                  isWinner={profiles[m.senderAlias]?.isWeeklyTop}
                />
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {view === 'SOCIAL' && <SocialWall posts={posts} user={user} onCreatePost={handleCreatePost} onLike={() => {}} onAddComment={() => {}} onLikeComment={() => {}} onAliasClick={openProfile} />}
          {view === 'ADMIN' && (
            <AdminDashboard 
              messages={messages} profiles={profiles}
              onDelete={async (id) => { if(isSupabaseConfigured) await supabase.from('messages').delete().eq('id', id); }}
              onFlag={async (id) => { 
                const msg = messages.find(m => m.id === id);
                if(isSupabaseConfigured) await supabase.from('messages').update({ isFlagged: !msg?.isFlagged }).eq('id', id);
              }}
              onMute={(a) => setMutedAliases(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
              mutedUsers={mutedAliases} settings={settings} onUpdateSettings={handleUpdateSettings}
            />
          )}
          {view === 'ABOUT' && <AboutPage />}
          {view === 'DONATE' && <DonationPage settings={settings} />}
          {view === 'PROFILE' && selectedProfileAlias && (
            <ProfilePage 
              profile={profiles[selectedProfileAlias] || { alias: selectedProfileAlias, role: 'USER', reputation: 10, followers: [], following: [], joinedAt: new Date(), totalLikesReceived: 0, totalTransmissions: 0 }} 
              viewerAlias={user.alias} onFollow={() => {}} onUpdateProfile={handleUpdateProfile}
              userPosts={posts.filter(p => p.authorAlias === selectedProfileAlias)}
              userMessages={messages.filter(m => m.senderAlias === selectedProfileAlias)}
            />
          )}
        </div>
      </main>

      {view === 'CHAT' && (
        <div className="bg-slate-950/90 backdrop-blur-2xl border-t border-slate-900 p-2">
          {replyTarget && (
            <div className="max-w-4xl mx-auto px-6 py-2 bg-slate-900/50 rounded-t-2xl flex justify-between items-center border-x border-t border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Replying to <span className="text-blue-500 font-black">@{replyTarget.senderAlias}</span></span>
              <button onClick={() => setReplyTarget(null)} className="text-slate-600 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          )}
          <Composer onSendMessage={handleSendMessage} disabled={mutedAliases.includes(user.alias)} recentUsers={[...new Set(messages.map(m => m.senderAlias))]} />
        </div>
      )}
    </div>
  );
};

export default App;
