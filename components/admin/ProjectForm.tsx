'use client';
// components/admin/ProjectForm.tsx
import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/upload';
import toast from 'react-hot-toast';
import type { Project, Category, PricingPlan } from '@/types';

interface Props {
  project:    Project | null;
  categories: Category[];
  onClose:    () => void;
  onSave:     () => void;
}

const EMPTY_PLAN = { plan_name: 'monthly' as const, price: 0, currency: 'USD', is_popular: false, features: [] as string[] };

export function ProjectForm({ project, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    title:         project?.title ?? '',
    description:   project?.description ?? '',
    category_id:   project?.category_id ?? '',
    image_url:     project?.image_url ?? '',
    live_demo_url: project?.live_demo_url ?? '',
    github_url:    project?.github_url ?? '',
    video_url:     project?.video_url ?? '',
    type:          project?.type ?? 'project' as 'project' | 'system',
    tags:          project?.tags?.join(', ') ?? '',
    features:      project?.features?.join('\n') ?? '',
    is_featured:   project?.is_featured ?? false,
  });

  const [plans, setPlans] = useState<Partial<PricingPlan>[]>(
    project?.pricing_plans ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'projects');
      setForm(f => ({ ...f, image_url: url }));
      toast.success('تم رفع الصورة');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('اسم المشروع مطلوب'); return; }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      title:         form.title,
      description:   form.description || null,
      category_id:   form.category_id || null,
      image_url:     form.image_url || null,
      live_demo_url: form.live_demo_url || null,
      github_url:    form.github_url || null,
      video_url:     form.video_url || null,
      type:          form.type,
      tags:          form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      features:      form.features ? form.features.split('\n').map(f => f.trim()).filter(Boolean) : null,
      is_featured:   form.is_featured,
    };

    let projectId = project?.id;

    if (project) {
      const { error } = await supabase.from('projects').update(payload).eq('id', project.id);
      if (error) { toast.error('خطأ في التحديث'); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('projects').insert([payload]).select().single();
      if (error || !data) { toast.error('خطأ في الإضافة'); setSaving(false); return; }
      projectId = data.id;
    }

    // Sync pricing plans (only for systems)
    if (form.type === 'system' && projectId) {
      await supabase.from('pricing_plans').delete().eq('project_id', projectId);
      if (plans.length > 0) {
        await supabase.from('pricing_plans').insert(
          plans.map(p => ({ ...p, project_id: projectId, features: p.features ?? [] }))
        );
      }
    }

    toast.success(project ? 'تم التحديث' : 'تم الإضافة');
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 glass"
        style={{ border: '1px solid var(--c-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black" style={{ color: 'var(--c-text)' }}>
            {project ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--c-text3)' }}><X size={20} /></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Image upload */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--c-text3)' }}>صورة المشروع</label>
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

          {/* Basic fields */}
          {[
            { key: 'title',         label: 'اسم المشروع *',           type: 'text' },
            { key: 'live_demo_url', label: 'رابط Demo (اختياري)',      type: 'url'  },
            { key: 'github_url',    label: 'رابط GitHub (اختياري)',    type: 'url'  },
            { key: 'video_url',     label: 'رابط فيديو (اختياري)',     type: 'url'  },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form] as string}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
              />
            </div>
          ))}

          {/* Description */}
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

          {/* Features */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>المميزات (سطر لكل ميزة)</label>
            <textarea
              rows={3}
              placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
              value={form.features}
              onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          {/* Row: category + type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>القسم</label>
              <select
                value={form.category_id}
                onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
              >
                <option value="">بدون قسم</option>
                {categories.filter(c => c.slug !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>النوع</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as 'project' | 'system' }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
              >
                <option value="project">موقع / مشروع</option>
                <option value="system">نظام</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>التقنيات (مفصولة بفاصلة)</label>
            <input
              type="text"
              placeholder="Next.js, React, Supabase"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
              className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
              style={{ background: form.is_featured ? 'var(--c-accent)' : 'var(--c-bg3)', border: '1px solid var(--c-border)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ right: form.is_featured ? '2px' : 'calc(100% - 22px)' }}
              />
            </div>
            <span className="text-sm" style={{ color: 'var(--c-text2)' }}>مشروع مميز (يظهر أولاً)</span>
          </label>

          {/* Pricing plans — only for systems */}
          {form.type === 'system' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold" style={{ color: 'var(--c-text3)' }}>باقات الاشتراك</label>
                <button
                  onClick={() => setPlans(p => [...p, { ...EMPTY_PLAN }])}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--c-accent-lt)' }}
                >
                  <Plus size={12} /> إضافة باقة
                </button>
              </div>
              {plans.map((plan, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <select
                    value={plan.plan_name}
                    onChange={e => setPlans(ps => ps.map((p, j) => j === i ? { ...p, plan_name: e.target.value as PricingPlan['plan_name'] } : p))}
                    className="flex-1 px-2 py-2 rounded-xl text-xs outline-none"
                    style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                  >
                    <option value="monthly">شهري</option>
                    <option value="lifetime">مدى الحياة</option>
                    <option value="source_code">نسخة التوزيع</option>
                  </select>
                  <input
                    type="number"
                    placeholder="السعر"
                    value={plan.price ?? ''}
                    onChange={e => setPlans(ps => ps.map((p, j) => j === i ? { ...p, price: +e.target.value } : p))}
                    className="w-24 px-2 py-2 rounded-xl text-xs outline-none"
                    style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                  />
                  <select
                    value={plan.currency ?? 'USD'}
                    onChange={e => setPlans(ps => ps.map((p, j) => j === i ? { ...p, currency: e.target.value } : p))}
                    className="w-16 px-2 py-2 rounded-xl text-xs outline-none"
                    style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                  >
                    <option value="USD">$</option>
                    <option value="EGP">ج.م</option>
                  </select>
                  <button onClick={() => setPlans(ps => ps.filter((_, j) => j !== i))} style={{ color: '#f87171' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
            >
              {saving ? 'جاري الحفظ...' : (project ? 'حفظ التعديلات' : 'إضافة المشروع')}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold glass"
              style={{ border: '1px solid var(--c-border)', color: 'var(--c-text2)' }}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
