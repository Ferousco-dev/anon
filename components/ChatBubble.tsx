import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  onReply: () => void;
  onTagClick: (tag: string) => void;
  isReply: boolean;
  parentMessage?: Message;
  onJumpToParent: (pid: string) => void;
  isUnread?: boolean;
  onSeen?: (id: string) => void;
  onAliasClick?: (alias: string) => void;
  isWinner?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  onReply, 
  onTagClick, 
  isReply, 
  parentMessage, 
  onJumpToParent,
  isUnread,
  onSeen,
  onAliasClick,
  isWinner
}) => {
  const isAdmin = message.senderRole === 'ADMIN';
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUnread && onSeen && elementRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onSeen(message.id);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(elementRef.current);
      return () => observer.disconnect();
    }
  }, [isUnread, message.id, onSeen]);
  
  const renderContent = (content: string) => {
    return String(content).split(/(\s+)/).map((part, i) => {
      if (part.startsWith('@')) return (
        <span 
          key={i} 
          onClick={() => onAliasClick?.(part)}
          className="text-blue-400 font-bold underline cursor-pointer hover:text-blue-300 transition-colors"
        >
          {part}
        </span>
      );
      if (part.startsWith('#')) return (
        <span 
          key={i} 
          onClick={() => onTagClick(part.toLowerCase())}
          className="text-blue-500 font-mono italic cursor-pointer hover:underline decoration-blue-500/30"
        >
          {part}
        </span>
      );
      return part;
    });
  };

  const dateObj = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
  const timeString = isNaN(dateObj.getTime()) ? '--:--' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      id={`msg-${message.id}`}
      ref={elementRef}
      className={`group flex flex-col mb-6 transition-all duration-500 items-start rounded-2xl relative ${message.isFlagged ? 'opacity-40 grayscale' : ''}`}
    >
      {isUnread && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
      )}

      <div className="flex items-center gap-2 mb-1.5 px-1">
        <div className="flex items-center gap-1">
          <span 
            onClick={() => onAliasClick?.(message.senderAlias)}
            className={`text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${isWinner ? 'text-yellow-500 hover:text-yellow-400' : 'text-slate-400 hover:text-white'}`}
          >
            @{String(message.senderAlias)}
          </span>
          {isWinner && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-yellow-500 animate-pulse">★</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-[6px] font-bold shadow-sm">✓</div>
            </div>
          )}
        </div>
        {isAdmin && <span className="bg-blue-500/10 text-blue-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">GENESIS ∞</span>}
        {message.isFlagged && <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-500/20">FLAGGED</span>}
        <span className="text-[9px] text-slate-600 font-medium">{timeString}</span>
      </div>

      <div className="relative max-w-[90%] md:max-w-[75%] w-full">
        {isReply && (
          <div 
            onClick={() => parentMessage && onJumpToParent(parentMessage.id)}
            className="mb-[-12px] ml-4 mr-2 bg-slate-900/60 border-l-4 border-blue-500/50 p-3 pt-2 pb-6 text-[11px] text-slate-400 rounded-t-2xl line-clamp-2 italic cursor-pointer hover:bg-slate-800 transition-colors shadow-inner flex items-start gap-3 group/reply"
          >
            <div className="mt-0.5 text-blue-500/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-blue-500/80 not-italic font-black text-[9px] uppercase tracking-[0.2em] block mb-1">REFERENCE: @{String(parentMessage?.senderAlias || 'deleted')}</span>
              <span className="group-hover/reply:text-slate-200 transition-colors leading-relaxed">{String(parentMessage?.content || 'Transmission purged.')}</span>
            </div>
          </div>
        )}
        
        <div className={`px-5 py-4 rounded-3xl shadow-2xl transition-all border relative z-10
          ${isUnread ? 'ring-1 ring-blue-500/30 shadow-blue-900/10' : ''}
          ${isAdmin 
            ? 'bg-slate-900 border-blue-500/20 text-slate-200 shadow-blue-500/5' 
            : isWinner
              ? 'bg-slate-900 border-yellow-500/20 text-slate-100'
              : 'bg-slate-900/60 border-slate-800 text-slate-100 group-hover:border-slate-700'}`}>
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium">{renderContent(message.content)}</p>
          
          <button 
            onClick={onReply}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-slate-950/80 p-2 rounded-xl text-slate-500 hover:text-blue-400 hover:scale-110 active:scale-95 border border-white/5 backdrop-blur-sm"
            title="Reply"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
