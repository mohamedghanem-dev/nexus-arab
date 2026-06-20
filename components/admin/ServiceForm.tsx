'use client';
// components/admin/ServiceForm.tsx
import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/upload';
import toast from 'react-hot-toast';
import type { Service } from '@/types';

interface Props {
  service: Service | null;
  onClose: () => void;
  onSave:  () => void;
}

export function ServiceForm({ service, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    title:                service?.title ?? '',
    description:          service?.description ?? '',
    price:                service?.price ?? '',
    image_url:            service?.image_url ?? '',
    show_whatsapp_button: service?.show_whatsapp_button ?? true,
    whatsapp_message:     service?.whatsapp_message ?? '',
    is_active:            service?.is_active ?? true,
    sort_order:           service?.sort_order ?? 0,
  });

  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'services');
      setForm(f => ({ ...f, image_url: url }));
      toast.success('تم رفع الصورة');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('اسم الخدمة مطلوب'); return; }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      title:                form.title,
      description:          form.description || null,
      price:                form.price || null, // اتركه فاضي لو السعر "حسب الطلب فقط مع الفريق"
      image_url:            form.image_url || null,
      show_whatsapp_button: form.show_whatsapp_button,
      whatsapp_message:     form.whatsapp_message || null,
      is_active:            form.is_active,
      sort_order:           form.sort_order,
    };

    const { error } = service
      ? await supabase.from('services').update(payload).eq('id', service.id)
      : await supabase.from('services').insert([payload]);

    setSaving(false);
    if (error) { toast.error('خطأ في الحفظ'); return; }
    toast.success(service ? 'تم التحديث' : 'تمت الإضافة');
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 glass" style={{ border: '1px solid var(--c-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black" style={{ color: 'var(--c-text)' }}>
            {service ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--c-text3)' }}><X size={20} /></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Image upload */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--c-text3)' }}>
              صورة الخدمة (اختياري — يتم ضغطها تلقائياً عند الرفع)
            </label>
            <div className="flex items-center gap-4">
              {form.image_url && (
                <Image src={form.image_url} alt="preview" width={80} height={60} className="rounded-xl object-cover" />
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

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>اسم الخدمة *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>الوصف</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>
              السعر (نص حر — مثلاً &quot;يبدأ من 3999 ج.م&quot; — اتركه فاضي لو السعر يتحدد مع الفريق فقط)
            </label>
            <input
              type="text"
              placeholder="اتركه فاضي لعدم إظهار سعر"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>رسالة واتساب مخصصة (اختياري)</label>
            <input
              type="text"
              placeholder="لو فاضي هيتبعت: مرحباً، أريد الاستفسار عن خدمة: [اسم الخدمة]"
              value={form.whatsapp_message}
              onChange={e => setForm(p => ({ ...p, whatsapp_message: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm(p => ({ ...p, show_whatsapp_button: !p.show_whatsapp_button }))}
                className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
                style={{ background: form.show_whatsapp_button ? 'var(--c-accent)' : 'var(--c-bg3)', border: '1px solid var(--c-border)' }}
              >
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ right: form.show_whatsapp_button ? '2px' : 'calc(100% - 22px)' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--c-text2)' }}>زر طلب واتساب</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
                style={{ background: form.is_active ? 'var(--c-accent)' : 'var(--c-bg3)', border: '1px solid var(--c-border)' }}
              >
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ right: form.is_active ? '2px' : 'calc(100% - 22px)' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--c-text2)' }}>تظهر في الموقع</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>ترتيب الظهور</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: +e.target.value }))}
              className="w-32 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
            >
              {saving ? 'جاري الحفظ...' : (service ? 'حفظ التعديلات' : 'إضافة الخدمة')}
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
