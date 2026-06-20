'use client';
// app/admin/categories/page.tsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Category } from '@/types';

const slugify = (s: string) =>
  s.trim().toLowerCase()
    .replace(/[\u0600-\u06FF]/g, '') // الأقسام بالعربي تحتاج slug إنجليزي يدوي لو الاسم عربي بالكامل
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [formOpen, setFormOpen]     = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);
  const [name, setName]             = useState('');
  const [slug, setSlug]             = useState('');
  const [sortOrder, setSortOrder]   = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving]         = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openForm = (cat: Category | null) => {
    setEditing(cat);
    setName(cat?.name ?? '');
    setSlug(cat?.slug ?? '');
    setSortOrder(cat?.sort_order ?? (categories.length ? Math.max(...categories.map(c => c.sort_order)) + 1 : 0));
    setSlugTouched(!!cat);
    setFormOpen(true);
  };

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const save = async () => {
    if (!name.trim() || !slug.trim()) { toast.error('الاسم والـ slug مطلوبان'); return; }
    setSaving(true);
    const supabase = createClient();
    const payload = { name, slug, sort_order: sortOrder };

    const { error } = editing
      ? await supabase.from('categories').update(payload).eq('id', editing.id)
      : await supabase.from('categories').insert([payload]);

    setSaving(false);
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'الـ slug مستخدم من قبل' : 'حدث خطأ في الحفظ');
      return;
    }
    toast.success(editing ? 'تم التحديث' : 'تمت الإضافة');
    setFormOpen(false);
    load();
  };

  const remove = async (cat: Category) => {
    if (cat.slug === 'all') { toast.error('لا يمكن حذف قسم "الكل"'); return; }
    if (!confirm(`حذف القسم "${cat.name}"؟ المشاريع التابعة له ستصبح بدون قسم.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) toast.error('خطأ في الحذف');
    else { toast.success('تم الحذف'); load(); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm" style={{ color: 'var(--c-text3)' }}>جاري التحميل...</div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--c-text)' }}>الأقسام ({categories.length})</h1>
        <button
          onClick={() => openForm(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
        >
          <Plus size={16} /> إضافة قسم
        </button>
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--c-text3)' }}>
        رقم الترتيب يحدد مكان ظهور القسم في فلتر المشاريع بالموقع — الأصغر يظهر أولاً.
        قسم "الكل" (all) ثابت ولازم يفضل موجود.
      </p>

      <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg3)' }}>
              {['الترتيب', 'الاسم', 'Slug', 'الإجراءات'].map(h => (
                <th key={h} className="text-right px-4 py-3 font-semibold text-xs" style={{ color: 'var(--c-text3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--c-border)' }} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3" style={{ color: 'var(--c-text3)' }}>
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} />
                    {c.sort_order}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--c-text)' }}>{c.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--c-glass)', color: 'var(--c-text3)', border: '1px solid var(--c-border)' }}>
                    {c.slug}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openForm(c)} className="p-1.5 rounded-lg" style={{ color: 'var(--c-accent-lt)', background: 'rgba(37,99,235,0.1)' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(c)} className="p-1.5 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--c-text3)' }}>لا توجد أقسام بعد.</div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 glass" style={{ border: '1px solid var(--c-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black" style={{ color: 'var(--c-text)' }}>
                {editing ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h2>
              <button onClick={() => setFormOpen(false)} style={{ color: 'var(--c-text3)' }}><X size={20} /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>اسم القسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="مثلاً: بوتات تليجرام"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>Slug (إنجليزي فقط، يُستخدم في الرابط)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                  placeholder="telegram-bots"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>ترتيب الظهور</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={e => setSortOrder(+e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
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
                  {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة القسم')}
                </button>
                <button onClick={() => setFormOpen(false)} className="px-6 py-3 rounded-xl font-bold glass" style={{ border: '1px solid var(--c-border)', color: 'var(--c-text2)' }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
