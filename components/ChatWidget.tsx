'use client';
// components/ChatWidget.tsx
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  whatsappNumber?: string | null;
  assistantName?: string | null;
}

const QUICK_MSGS = [
  { label: 'ما هي خدماتكم؟',        text: 'ما هي الخدمات التي تقدمها Nexus Arab؟' },
  { label: 'كم سعر الموقع؟',         text: 'ما هو سعر تصميم موقع إلكتروني احترافي؟' },
  { label: 'تطبيق موبايل',           text: 'هل تقدمون تطوير تطبيقات موبايل؟ وما التكلفة؟' },
  { label: 'نظام إداري',             text: 'أريد بناء نظام إداري لشركتي، ما الخيارات المتاحة؟' },
  { label: 'مدة التسليم',            text: 'ما هي مدة تسليم المشاريع عادة؟' },
];

export function ChatWidget({ whatsappNumber, assistantName }: Props) {
  const WHATSAPP = whatsappNumber || '201095097334';
  const NAME = assistantName || 'Nexus AI';

  const WELCOME = `مرحباً! أنا ${NAME}، المساعد الذكي لـ Nexus Arab.
يسعدني مساعدتك في الاستفسار عن خدماتنا. اختر سؤالاً أو اكتب استفسارك.`;

  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [count, setCount]       = useState(0); // للعرض فقط — السيرفر هو الحَكَم الفعلي
  const [limitHit, setLimitHit] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: WELCOME }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading || limitHit) return;

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          whatsappNumber: WHATSAPP,
        }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setCount(c => c + 1);
      if (data.limitReached) setLimitHit(true);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ. تواصل معنا على واتساب للمساعدة الفورية.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))',
          boxShadow: '0 0 30px var(--c-glow)',
        }}
        aria-label="فتح المحادثة"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 left-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl flex flex-col glass"
          style={{ border: '1px solid var(--c-border)', maxHeight: '520px' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">{NAME}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-white/80 text-xs">متصل</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: 200, maxHeight: 300 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                  style={{
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))'
                      : 'var(--c-bg3)',
                    color: m.role === 'user' ? '#fff' : 'var(--c-text)',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl text-sm" style={{ background: 'var(--c-bg3)', color: 'var(--c-text3)' }}>
                  <span className="animate-pulse">يكتب...</span>
                </div>
              </div>
            )}

            {/* Limit reached — WhatsApp CTA */}
            {limitHit && (
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('مرحباً، أريد التحدث مع فريق Nexus Arab')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white text-sm"
                style={{ background: '#16a34a' }}
              >
                <ExternalLink size={14} />
                تواصل معنا على واتساب
              </a>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick messages */}
          {messages.length <= 1 && !limitHit && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
              {QUICK_MSGS.map(q => (
                <button
                  key={q.label}
                  onClick={() => send(q.text)}
                  className="text-xs px-2.5 py-1.5 rounded-xl transition-all hover:opacity-80"
                  style={{
                    background: 'var(--c-glass)',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-accent-lt)',
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          {!limitHit && (
            <div
              className="flex items-center gap-2 px-3 py-3"
              style={{ borderTop: '1px solid var(--c-border)' }}
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="اكتب سؤالك..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--c-bg3)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
              >
                <Send size={15} />
              </button>
            </div>
          )}

          {/* Question counter */}
          {!limitHit && count > 0 && (
            <p className="text-center text-xs pb-2" style={{ color: 'var(--c-text3)' }}>
              {count} / {6} أسئلة
            </p>
          )}
        </div>
      )}
    </>
  );
}
