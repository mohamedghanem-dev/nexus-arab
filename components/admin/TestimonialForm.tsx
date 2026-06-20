'use client';
// components/admin/TestimonialForm.tsx
import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Upload, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/upload';
import toast from 'react-hot-toast';
import type { Testimonial } from '@/types';

interface Props {
  testimonial: Testimonial | null;
  nextSortOrder: number;
  onClose: () => void;
  onSave:  () => void;
}

export function TestimonialForm({ testimonial, nextSortOrder, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name:       testimonial?.name ?? '',
    role:       testimonial?.role ?? '',
    company:    testimonial?.company ?? '',
    avatar_url: testimonial?.avatar_url ?? '',
    content:    testimonial?.content ?? '',
    rating:     testimonial?.rating ?? 5,
    is_active:  testimonial?.is_active ?? true,
    sort_order: testimonial?.sort_order ?? nextSortOrder,
  });

  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'avatars');
      setForm(f => ({ ...f, avatar_url: url }));
      toast.success('تم رفع الصورة');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim() || !form.content.trim()) { toast.error('الاسم ونص الرأي مطلوبان'); return; }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name:       form.name,
      role:       form.role || null,
      company:    form.company || null,
      avatar_url: form.avatar_url || null,
      content:    form.content,
      rating:     form.rating,
      is_active:  form.is_active,
      sort_order: form.sort_order,
    };

    const { error } = testimonial
      ? await supabase.from('testimonials').update(payload).eq('id', testimonial.id)
      : await supabase.from('testimonials').insert([payload]);

    setSaving(false);
    if (error) { toast.error('خطأ في الحفظ'); return; }
    toast.success(testimonial ? 'تم التحديث' : 'تمت الإضافة');
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 glass" style={{ border: '1px solid var(--c-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black" style={{ color: 'var(--c-text)' }}>
            {testimonial ? 'تعديل الرأي' : 'إضافة رأي جديد'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--c-text3)' }}><X size={20} /></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Avatar upload */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--c-text3)' }}>صورة العميل (اختياري)</label>
            <div className="flex items-center gap-4">
              {form.avatar_url && (
                <Image src={form.avatar_url} alt="preview" width={56} height={56} className="rounded-full object-cover" />
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass"
                style={{ border: '1px solid var(--c-border)', color: 'var(--c-text2)' }}
              >
                <Upload size={16} />
                {uploading ? 'جاري الرفع...' : 'رفع صورة'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>الاسم *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>المنصب (اختياري)</label>
              <input
                type="text"
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>الشركة (اختياري)</label>
            <input
              type="text"
              value={form.company}
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>نص الرأي *</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--c-text3)' }}>التقييم</label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <button key={idx} onClick={() => setForm(p => ({ ...p, rating: idx + 1 }))}>
                  <Star size={24} fill={idx < form.rating ? '#fbbf24' : 'none'} style={{ color: idx < form.rating ? '#fbbf24' : 'var(--c-text3)' }} />
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
              style={{ background: form.is_active ? 'var(--c-accent)' : 'var(--c-bg3)', border: '1px solid var(--c-border)' }}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ right: form.is_active ? '2px' : 'calc(100% - 22px)' }} />
            </div>
            <span className="text-sm" style={{ color: 'var(--c-text2)' }}>يظهر في الموقع</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
            >
              {saving ? 'جاري الحفظ...' : (testimonial ? 'حفظ التعديلات' : 'إضافة الرأي')}
            </button>
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold glass" style={{ border: '1px solid var(--c-border)', color: 'var(--c-text2)' }}>
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
