'use client';
// components/sections/ProjectsSection.tsx
import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Github, Play, Monitor, CheckCircle } from 'lucide-react';
import type { Project, Category } from '@/types';

const DEFAULT_WHATSAPP = '201095097334';

interface Props {
  projects: Project[];
  categories: Category[];
  whatsappNumber?: string | null;
}

function PricingBadge({ plan }: { plan: string }) {
  const labels: Record<string, string> = {
    monthly: 'شهري',
    lifetime: 'مدى الحياة',
    source_code: 'نسخة التوزيع',
  };
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'var(--c-accent-lt)' }}
    >
      {labels[plan] ?? plan}
    </span>
  );
}

function ProjectCard({ project, whatsapp }: { project: Project; whatsapp: string }) {
  const [expanded, setExpanded] = useState(false);

  const waMsg = encodeURIComponent(
    `مرحباً، أريد الاستفسار عن مشروع: ${project.title}`
  );
  const waLink = `https://wa.me/${whatsapp}?text=${waMsg}`;

  return (
    <div
      className="rounded-2xl overflow-hidden glass transition-all duration-300 hover:border-opacity-60 flex flex-col"
      style={{ border: '1px solid var(--c-border)' }}
    >
      {/* Image — 60% of card */}
      <div className="relative h-48 overflow-hidden bg-[var(--c-bg3)]">
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Monitor size={40} style={{ color: 'var(--c-text3)' }} />
          </div>
        )}
        {/* Type badge */}
        <span
          className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold text-white"
          style={{ background: project.type === 'system' ? 'var(--c-accent)' : 'var(--c-cyan)' }}
        >
          {project.type === 'system' ? 'نظام' : 'موقع'}
        </span>
      </div>

      {/* Content — 40% */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--c-text)' }}>
            {project.title}
          </h3>
          {project.category && (
            <span className="text-xs shrink-0 px-2 py-0.5 rounded-full" style={{ background: 'var(--c-glass)', color: 'var(--c-text3)', border: '1px solid var(--c-border)' }}>
              {project.category.name}
            </span>
          )}
        </div>

        {project.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--c-text2)' }}>
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {project.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--c-bg3)', color: 'var(--c-text3)' }}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Expand details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs mt-1 font-semibold text-right"
          style={{ color: 'var(--c-accent-lt)' }}
        >
          {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </button>

        {expanded && (
          <div className="mt-2 flex flex-col gap-3 animate-fade-in">
            {/* Features */}
            {project.features?.length ? (
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--c-text3)' }}>المميزات</p>
                <ul className="flex flex-col gap-1">
                  {project.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text2)' }}>
                      <CheckCircle size={12} style={{ color: 'var(--c-cyan)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Pricing — for systems */}
            {project.type === 'system' && project.pricing_plans?.length ? (
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--c-text3)' }}>الاشتراكات</p>
                <div className="flex flex-col gap-2">
                  {project.pricing_plans.map(plan => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-2 rounded-xl"
                      style={{ background: plan.is_popular ? 'rgba(37,99,235,0.15)' : 'var(--c-glass)', border: `1px solid ${plan.is_popular ? 'var(--c-accent)' : 'var(--c-border)'}` }}
                    >
                      <PricingBadge plan={plan.plan_name} />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black" style={{ color: 'var(--c-text)' }}>
                          {plan.price} {plan.currency === 'USD' ? '$' : 'ج.م'}
                        </span>
                        <a
                          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`أريد اشتراك ${plan.plan_name === 'monthly' ? 'الشهري' : plan.plan_name === 'lifetime' ? 'مدى الحياة' : 'نسخة التوزيع'} في نظام ${project.title}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded-lg text-white font-bold"
                          style={{ background: '#16a34a' }}
                        >
                          اشترك
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Links */}
            <div className="flex gap-2 flex-wrap">
              {project.live_demo_url && (
                <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                  style={{ background: 'var(--c-accent)' }}>
                  <ExternalLink size={12} /> Demo
                </a>
              )}
              {project.video_url && (
                <a href={project.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                  style={{ background: 'var(--c-cyan)' }}>
                  <Play size={12} /> فيديو
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold glass"
                  style={{ color: 'var(--c-text2)', border: '1px solid var(--c-border)' }}>
                  <Github size={12} /> GitHub
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
        >
          استفسر عن هذا المشروع
        </a>
      </div>
    </div>
  );
}

export function ProjectsSection({ projects, categories, whatsappNumber }: Props) {
  const [activeSlug, setActiveSlug] = useState('all');
  const whatsapp = whatsappNumber || DEFAULT_WHATSAPP;

  const filtered = activeSlug === 'all'
    ? projects
    : projects.filter(p => p.category?.slug === activeSlug);

  return (
    <section id="projects" className="section" style={{ background: 'var(--c-bg2)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--c-accent-lt)' }}>
            أعمالنا
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--c-text)' }}>
            مشاريعنا المنجزة
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveSlug(cat.slug)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: activeSlug === cat.slug ? 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' : 'var(--c-glass)',
                color: activeSlug === cat.slug ? '#fff' : 'var(--c-text2)',
                border: `1px solid ${activeSlug === cat.slug ? 'transparent' : 'var(--c-border)'}`,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => <ProjectCard key={p.id} project={p} whatsapp={whatsapp} />)}
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--c-text3)' }}>
            لا توجد مشاريع في هذا القسم حتى الآن.
          </div>
        )}
      </div>
    </section>
  );
}
