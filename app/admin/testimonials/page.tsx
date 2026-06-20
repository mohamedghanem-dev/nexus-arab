'use client';
// app/admin/testimonials/page.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deleteImage, extractStoragePath } from '@/lib/upload';
import toast from 'react-hot-toast';
import type { Testimonial } from '@/types';
import { TestimonialForm } from '@/components/admin/TestimonialForm';

export default function AdminTestimonialsPage() {
  const [items,   setItems]   = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing,  setEditing]  = useState<Testimonial | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (t: Testimonial) => {
    if (!confirm(`حذف رأي "${t.name}"؟`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', t.id);
    if (error) { toast.error('خطأ في الحذف'); return; }
    if (t.avatar_url) {
      const path = extractStoragePath(t.avatar_url);
      if (path) await deleteImage('avatars', path);
    }
    toast.success('تم الحذف');
    load();
  };

  const toggleActive = async (t: Testimonial) => {
    const supabase = createClient();
    await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
    load();
  };

  // تبديل ترتيب عنصرين متجاورين — الموقع يعرضهم في scroll أفقي بنفس ترتيب sort_order
  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    const supabase = createClient();
    await Promise.all([
      supabase.from('testimonials').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('testimonials').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm" style={{ color: 'var(--c-text3)' }}>جاري التحميل...</div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--c-text)' }}>آراء العملاء ({items.length})</h1>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
        >
          <Plus size={16} /> إضافة رأي
        </button>
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--c-text3)' }}>
        الآراء تظهر في الموقع بسكرول أفقي (مش تحت بعض). رتّبها بالأسهم تحت زي ما تحب.
      </p>

      <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg3)' }}>
              {['الترتيب', 'الصورة', 'الاسم', 'التقييم', 'مفعّل', 'الإجراءات'].map(h => (
                <th key={h} className="text-right px-4 py-3 font-semibold text-xs" style={{ color: 'var(--c-text3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--c-border)' }} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} style={{ color: 'var(--c-text3)', opacity: i === 0 ? 0.3 : 1 }}>
                      <ArrowUp size={14} />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} style={{ color: 'var(--c-text3)', opacity: i === items.length - 1 ? 0.3 : 1 }}>
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {t.avatar_url ? (
                    <Image src={t.avatar_url} alt={t.name} width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--c-bg3)', color: 'var(--c-text3)' }}>
                      {t.name.slice(0, 1)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--c-text)' }}>
                  <p className="font-medium">{t.name}</p>
                  {(t.role || t.company) && (
                    <p className="text-xs" style={{ color: 'var(--c-text3)' }}>{[t.role, t.company].filter(Boolean).join(' — ')}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={13} fill={idx < t.rating ? '#fbbf24' : 'none'} style={{ color: idx < t.rating ? '#fbbf24' : 'var(--c-text3)' }} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(t)}>
                    <div className="w-9 h-5 rounded-full relative" style={{ background: t.is_active ? 'var(--c-accent)' : 'var(--c-bg3)', border: '1px solid var(--c-border)' }}>
                      <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all" style={{ right: t.is_active ? '2px' : 'calc(100% - 18px)' }} />
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(t); setFormOpen(true); }} className="p-1.5 rounded-lg" style={{ color: 'var(--c-accent-lt)', background: 'rgba(37,99,235,0.1)' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(t)} className="p-1.5 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--c-text3)' }}>لا توجد آراء بعد.</div>
        )}
      </div>

      {formOpen && (
        <TestimonialForm
          testimonial={editing}
          nextSortOrder={items.length ? Math.max(...items.map(t => t.sort_order)) + 1 : 0}
          onClose={() => setFormOpen(false)}
          onSave={() => { setFormOpen(false); load(); }}
        />
      )}
    </div>
  );
}
