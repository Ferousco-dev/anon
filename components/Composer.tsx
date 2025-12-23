
import React, { useState, useRef, useEffect } from 'react';

const OFFICIALS = [
  'Dean of Students', 'HOD Comp Science', 'NACOS President', 'Faculty Dean', 'Chief Security', 'Exams Officer'
];

interface ComposerProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
  recentUsers: string[];
}

const Composer: React.FC<ComposerProps> = ({ onSendMessage, disabled, recentUsers }) => {
  const [input, setInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    const lastChar = val[val.length - 1];
    const words = val.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (name: string) => {
    const words = input.split(' ');
    words[words.length - 1] = `@${name.replace(/\s+/g, '')} `;
    setInput(words.join(' '));
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const allMentions = Array.from(new Set([...OFFICIALS, ...recentUsers]));
  const filteredMentions = allMentions.filter(m => m.toLowerCase().includes(mentionFilter)).slice(0, 6);

  return (
    <div className="w-full max-w-4xl mx-auto relative p-4">
      {showMentions && filteredMentions.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-2 bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Mention User</div>
          {filteredMentions.map(name => (
            <button 
              key={name}
              onClick={() => handleSelectMention(name)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-blue-600/20 hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold">@</div>
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-3 bg-slate-900/50 rounded-[28px] p-2 border border-slate-800 focus-within:border-blue-500/50 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
          placeholder={disabled ? "You are currently muted..." : "Send an anonymous message..."}
          disabled={disabled}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 resize-none py-3 px-4 text-sm leading-relaxed"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all shrink-0
            ${!input.trim() || disabled ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white shadow-lg hover:scale-105 active:scale-95'}`}
        >
          <svg className="h-5 w-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Composer;
