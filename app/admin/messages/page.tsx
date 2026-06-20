'use client';
// app/admin/messages/page.tsx
import { useEffect, useState } from 'react';
import { Trash2, Mail, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { ContactMessage } from '@/types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<'all' | 'unread'>('all');

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (m: ContactMessage) => {
    const supabase = createClient();
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', m.id);
    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, is_read: true } : x));
  };

  const remove = async (m: ContactMessage) => {
    if (!confirm('حذف هذه الرسالة نهائياً؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('contact_messages').delete().eq('id', m.id);
    if (error) { toast.error('خطأ في الحذف'); return; }
    toast.success('تم الحذف');
    setMessages(prev => prev.filter(x => x.id !== m.id));
  };

  const visible = filter === 'unread' ? messages.filter(m => !m.is_read) : messages;
  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm" style={{ color: 'var(--c-text3)' }}>جاري التحميل...</div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--c-text)' }}>
          الرسائل ({messages.length})
          {unreadCount > 0 && (
            <span className="mr-2 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              {unreadCount} جديدة
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--c-accent)' : 'var(--c-glass)',
                color:      filter === f ? '#fff' : 'var(--c-text3)',
                border: '1px solid var(--c-border)',
              }}
            >
              {f === 'all' ? 'الكل' : 'غير المقروءة'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {visible.map(m => (
          <div
            key={m.id}
            className="glass rounded-2xl p-5"
            style={{ border: `1px solid ${m.is_read ? 'var(--c-border)' : 'rgba(37,99,235,0.4)'}` }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold" style={{ color: 'var(--c-text)' }}>{m.name}</p>
                  {!m.is_read && (
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--c-accent)' }} />
                  )}
                </div>
                <p className="text-xs" style={{ color: 'var(--c-text3)' }}>
                  {new Date(m.created_at).toLocaleString('ar-EG')}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!m.is_read && (
                  <button onClick={() => markRead(m)} className="p-1.5 rounded-lg" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }} title="تحديد كمقروءة">
                    <CheckCircle2 size={15} />
                  </button>
                )}
                <button onClick={() => remove(m)} className="p-1.5 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }} title="حذف">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--c-text2)' }}>{m.message}</p>

            <div className="flex flex-wrap gap-3 text-xs">
              {m.email && (
                <a href={`mailto:${m.email}`} className="flex items-center gap-1.5" style={{ color: 'var(--c-accent-lt)' }}>
                  <Mail size={13} /> {m.email}
                </a>
              )}
              {m.phone && (
                <>
                  <a href={`tel:${m.phone}`} className="flex items-center gap-1.5" style={{ color: 'var(--c-accent-lt)' }}>
                    <Phone size={13} /> {m.phone}
                  </a>
                  <a
                    href={`https://wa.me/${m.phone.replace(/^0/, '20').replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                    style={{ color: '#22c55e' }}
                  >
                    <MessageCircle size={13} /> واتساب
                  </a>
                </>
              )}
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="glass rounded-2xl text-center py-16" style={{ color: 'var(--c-text3)', border: '1px solid var(--c-border)' }}>
            {filter === 'unread' ? 'لا توجد رسائل غير مقروءة' : 'لا توجد رسائل بعد'}
          </div>
        )}
      </div>
    </div>
  );
}
