'use client';
// app/admin/projects/page.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Monitor, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Project, Category } from '@/types';
import { ProjectForm } from '@/components/admin/ProjectForm';

export default function AdminProjectsPage() {
  const [projects,   setProjects]   = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [formOpen,   setFormOpen]   = useState(false);
  const [editing,    setEditing]    = useState<Project | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('projects')
      .select('*, category:categories(*), pricing_plans(*)')
      .order('sort_order')
      .order('created_at', { ascending: false });
    setProjects(data ?? []);

    const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(cats ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteProject = async (id: string) => {
    if (!confirm('حذف هذا المشروع نهائياً؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) toast.error('خطأ في الحذف');
    else { toast.success('تم الحذف'); load(); }
  };

  const toggleFeatured = async (p: Project) => {
    const supabase = createClient();
    await supabase.from('projects').update({ is_featured: !p.is_featured }).eq('id', p.id);
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
        <h1 className="text-xl font-black" style={{ color: 'var(--c-text)' }}>المشاريع ({projects.length})</h1>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
        >
          <Plus size={16} /> إضافة مشروع
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg3)' }}>
              {['الصورة', 'الاسم', 'القسم', 'النوع', 'مميز', 'الإجراءات'].map(h => (
                <th key={h} className="text-right px-4 py-3 font-semibold text-xs" style={{ color: 'var(--c-text3)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr
                key={p.id}
                style={{ borderBottom: '1px solid var(--c-border)' }}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.title} width={48} height={36} className="rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--c-bg3)' }}>
                      <Monitor size={16} style={{ color: 'var(--c-text3)' }} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--c-text)' }}>{p.title}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--c-glass)', color: 'var(--c-text3)', border: '1px solid var(--c-border)' }}>
                    {p.category?.name ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-1 rounded-lg text-white"
                    style={{ background: p.type === 'system' ? 'var(--c-accent)' : 'var(--c-cyan)' }}
                  >
                    {p.type === 'system' ? 'نظام' : 'موقع'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured(p)}>
                    <Star size={18} fill={p.is_featured ? '#fbbf24' : 'none'} style={{ color: p.is_featured ? '#fbbf24' : 'var(--c-text3)' }} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(p); setFormOpen(true); }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--c-accent-lt)', background: 'rgba(37,99,235,0.1)' }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--c-text3)' }}>
            لا توجد مشاريع. أضف مشروعك الأول.
          </div>
        )}
      </div>

      {/* Form modal */}
      {formOpen && (
        <ProjectForm
          project={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSave={() => { setFormOpen(false); load(); }}
        />
      )}
    </div>
  );
}
