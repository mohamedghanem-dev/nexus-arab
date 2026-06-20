'use client';
// app/admin/settings/page.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Settings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('settings').select('*').single();
      if (data) setSettings(data);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('settings').update(settings).eq('id', settings.id!);
    setSaving(false);
    if (error) toast.error('خطأ في الحفظ');
    else toast.success('تم حفظ الإعدادات');
  };

  const field = (key: keyof Settings, label: string, type: string = 'text', placeholder?: string) => (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(settings[key] as string) ?? ''}
        onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
      />
    </div>
  );

  if (loading) return <div className="text-center py-16" style={{ color: 'var(--c-text3)' }}>جاري التحميل...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-black mb-6" style={{ color: 'var(--c-text)' }}>إعدادات الشركة</h1>

      <div className="flex flex-col gap-8">

        {/* Company info */}
        <Section title="بيانات الشركة">
          {field('agency_name', 'اسم الشركة', 'text', 'Nexus Arab')}
          {field('tagline',     'الشعار / Tagline', 'text', 'نُشيد الأعمال الرقمية للمستقبل')}
          {field('email',       'البريد الإلكتروني', 'email')}
          {field('phone',       'رقم الهاتف', 'tel', '+20...')}
          {field('whatsapp_number', 'رقم واتساب (بدون +)', 'tel', '201095097334')}
        </Section>

        {/* Social links */}
        <Section title="روابط التواصل الاجتماعي">
          {field('instagram_url', 'Instagram', 'url', 'https://instagram.com/...')}
          {field('facebook_url',  'Facebook',  'url', 'https://facebook.com/...')}
          {field('linkedin_url',  'LinkedIn',  'url', 'https://linkedin.com/...')}
          {field('youtube_url',   'YouTube',   'url', 'https://youtube.com/...')}
          {field('x_url',         'X (Twitter)', 'url', 'https://x.com/...')}
          {field('telegram_url',  'Telegram',  'url', 'https://t.me/...')}
        </Section>

        {/* AI Config */}
        <Section title="إعدادات مساعد الذكاء الاصطناعي">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>
              تفعيل المساعد الذكي
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setSettings(p => ({ ...p, ai_assistant_enabled: !p.ai_assistant_enabled }))}
                className="w-11 h-6 rounded-full transition-colors relative"
                style={{ background: settings.ai_assistant_enabled ? 'var(--c-accent)' : 'var(--c-bg3)', border: '1px solid var(--c-border)' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ right: settings.ai_assistant_enabled ? '2px' : 'calc(100% - 22px)' }}
                />
              </div>
              <span className="text-sm" style={{ color: 'var(--c-text2)' }}>
                {settings.ai_assistant_enabled ? 'مفعّل' : 'معطّل'}
              </span>
            </label>
          </div>
          {field('ai_assistant_name', 'اسم المساعد', 'text', 'Nexus AI')}
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: 'var(--c-text2)' }}>
            مفاتيح Groq و Gemini API لا تُخزَّن في قاعدة البيانات أبداً (حماية من أي تسريب
            عبر anon key العام). يتم إدارتها فقط من Environment Variables في إعدادات
            المشروع على Vercel. تواصل مع المطور لتحديثها أو إضافة مفاتيح جديدة.
          </div>
        </Section>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          className="py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4" style={{ border: '1px solid var(--c-border)' }}>
      <h2 className="font-bold text-sm pb-2" style={{ color: 'var(--c-text)', borderBottom: '1px solid var(--c-border)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
