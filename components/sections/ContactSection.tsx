'use client';
// components/sections/ContactSection.tsx
import { useState } from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Settings } from '@/types';

interface Props { settings: Settings | null; }

export function ContactSection({ settings }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const waNumber = settings?.whatsapp_number ?? '201095097334';
  const email    = settings?.email ?? '';
  const phone    = settings?.phone ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error('يرجى ملء الاسم والرسالة');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('contact_messages').insert([form]);
    setLoading(false);
    if (error) {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } else {
      toast.success('تم إرسال رسالتك بنجاح!');
      setForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <section id="contact" className="section" style={{ background: 'var(--c-bg2)' }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--c-accent-lt)' }}>
            تواصل معنا
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--c-text)' }}>
            هل أنت جاهز لنقل أعمالك للمستوى القادم؟
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: 'var(--c-text2)' }}>
            تواصل مع فريق Nexus Arab، واشرح لنا فكرة مشروعك لنحولها إلى نظام برمجي بريميوم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="flex flex-col gap-5">
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدمات Nexus Arab')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl glass transition-all hover:scale-[1.02]"
              style={{ border: '1px solid var(--c-border)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#16a34a' }}>
                <MessageSquare size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--c-text3)' }}>واتساب</p>
                <p className="font-bold" style={{ color: 'var(--c-text)' }}>+{waNumber}</p>
              </div>
            </a>

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 p-5 rounded-2xl glass transition-all hover:scale-[1.02]"
                style={{ border: '1px solid var(--c-border)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}>
                  <Mail size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--c-text3)' }}>البريد الإلكتروني</p>
                  <p className="font-bold" style={{ color: 'var(--c-text)' }}>{email}</p>
                </div>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-4 p-5 rounded-2xl glass transition-all hover:scale-[1.02]"
                style={{ border: '1px solid var(--c-border)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--c-bg3)' }}>
                  <Phone size={22} style={{ color: 'var(--c-accent-lt)' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--c-text3)' }}>الهاتف</p>
                  <p className="font-bold" style={{ color: 'var(--c-text)' }}>{phone}</p>
                </div>
              </a>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { key: 'name',    label: 'الاسم',            type: 'text',  required: true },
              { key: 'email',   label: 'البريد الإلكتروني', type: 'email', required: false },
              { key: 'phone',   label: 'رقم الهاتف',        type: 'tel',   required: false },
            ].map(f => (
              <input
                key={f.key}
                type={f.type}
                placeholder={f.label}
                required={f.required}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: 'var(--c-glass)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text)',
                  '--tw-ring-color': 'var(--c-accent)',
                } as React.CSSProperties}
              />
            ))}
            <textarea
              placeholder="اشرح لنا فكرة مشروعك..."
              required
              rows={4}
              value={form.message}
              onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 resize-none"
              style={{
                background: 'var(--c-glass)',
                border: '1px solid var(--c-border)',
                color: 'var(--c-text)',
                '--tw-ring-color': 'var(--c-accent)',
              } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
            >
              {loading ? 'جاري الإرسال...' : 'أرسل رسالتك'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
