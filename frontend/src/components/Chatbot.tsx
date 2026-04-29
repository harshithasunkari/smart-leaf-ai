import { useState } from 'react';
import { chat, apiErrorMessage } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from './Spinner';
import { X, MessageCircle, Send } from 'lucide-react';

export default function Chatbot() {
  const { t, language, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const res = await chat(q, language);
      const reply = res?.data?.reply ?? 'No response';
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'bot', text: apiErrorMessage(e) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(100vw-2.5rem,400px)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col max-h-[min(75vh,520px)]">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-brand-800 to-brand-900 px-4 py-3 text-white shrink-0">
            <div>
              <p className="text-sm font-bold">Advisor Chat</p>
              <p className="text-[10px] text-emerald-200/80">Smart Leaf AI</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="text-xs rounded-lg bg-white/15 px-2 py-1 border border-white/20 text-white"
                value={language}
                onChange={(e) => setLang(e.target.value as 'en' | 'hi' | 'te')}
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="te">TE</option>
              </select>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50 min-h-[180px]">
            {messages.length === 0 && (
              <p className="text-xs text-slate-500 p-2 leading-relaxed">
                Ask about diseases, pesticides, spray timing, or app usage.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-xl px-3 py-2.5 max-w-[85%] ${
                  m.role === 'user'
                    ? 'ml-auto bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="px-2 py-1">
                <Spinner className="text-brand-600" label="Thinking..." />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-slate-200 p-2 bg-white shrink-0">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
              placeholder="Ask about diseases or pesticides..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            />
            <button
              type="button"
              onClick={send}
              disabled={busy}
              className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl hover:scale-105 transition-all ring-4 ring-white/80 flex items-center justify-center"
        aria-label="Open chat"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}