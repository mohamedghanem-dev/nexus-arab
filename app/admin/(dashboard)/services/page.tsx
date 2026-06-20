'use client';
// app/admin/services/page.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deleteImage, extractStoragePath } from '@/lib/upload';
import toast from 'react-hot-toast';
import type { Service } from '@/types';
import { ServiceForm } from '@/components/admin/ServiceForm';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing,  setEditing]  = useState<Service | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (s: Service) => {
    if (!confirm(`حذف خدمة "${s.title}"؟`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('services').delete().eq('id', s.id);
    if (error) { toast.error('خطأ في الحذف'); return; }
    if (s.image_url) {
      const path = extractStoragePath(s.image_url);
      if (path) await deleteImage('services', path);
    }
    toast.success('تم الحذف');
    load();
  };

  const toggleActive = async (s: Service) => {
    const supabase = createClient();
    await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id);
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
        <h1 className="text-xl font-black" style={{ color: 'var(--c-text)' }}>الخدمات ({services.length})</h1>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
        >
          <Plus size={16} /> إضافة خدمة
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg3)' }}>
              {['الصورة', 'الخدمة', 'السعر', 'واتساب', 'مفعّلة', 'الإجراءات'].map(h => (
                <th key={h} className="text-right px-4 py-3 font-semibold text-xs" style={{ color: 'var(--c-text3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--c-border)' }} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  {s.image_url ? (
                    <Image src={s.image_url} alt={s.title} width={48} height={36} className="rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--c-bg3)' }}>
                      <Briefcase size={16} style={{ color: 'var(--c-text3)' }} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--c-text)' }}>{s.title}</td>
                <td className="px-4 py-3" style={{ color: 'var(--c-text2)' }}>{s.price || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: s.show_whatsapp_button ? 'rgba(34,197,94,0.15)' : 'var(--c-glass)', color: s.show_whatsapp_button ? '#22c55e' : 'var(--c-text3)' }}>
                    {s.show_whatsapp_button ? 'مفعّل' : 'معطّل'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(s)}>
                    <div className="w-9 h-5 rounded-full relative" style={{ background: s.is_active ? 'var(--c-accent)' : 'var(--c-bg3)', border: '1px solid var(--c-border)' }}>
                      <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all" style={{ right: s.is_active ? '2px' : 'calc(100% - 18px)' }} />
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(s); setFormOpen(true); }} className="p-1.5 rounded-lg" style={{ color: 'var(--c-accent-lt)', background: 'rgba(37,99,235,0.1)' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(s)} className="p-1.5 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--c-text3)' }}>لا توجد خدمات. أضف خدمتك الأولى.</div>
        )}
      </div>

      {formOpen && (
        <ServiceForm
          service={editing}
          onClose={() => setFormOpen(false)}
          onSave={() => { setFormOpen(false); load(); }}
        />
      )}
    </div>
  );
}
