// app/admin/page.tsx — Dashboard Overview
import { createClient } from '@/lib/supabase/server';
import { FolderOpen, Briefcase, MessageSquare, Star } from 'lucide-react';

async function getStats() {
  const supabase = createClient();
  const [projects, services, messages, testimonials] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('services').select('id', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('testimonials').select('id', { count: 'exact', head: true }),
  ]);
  return {
    projects:     projects.count ?? 0,
    services:     services.count ?? 0,
    unread:       messages.count ?? 0,
    testimonials: testimonials.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: 'المشاريع',      value: stats.projects,     icon: FolderOpen,    color: 'var(--c-accent)' },
    { label: 'الخدمات',       value: stats.services,     icon: Briefcase,     color: 'var(--c-cyan)' },
    { label: 'رسائل جديدة',   value: stats.unread,       icon: MessageSquare, color: '#f59e0b' },
    { label: 'آراء العملاء',  value: stats.testimonials, icon: Star,          color: '#10b981' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--c-text)' }}>
        مرحباً بك في لوحة التحكم
      </h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--c-text3)' }}>
        إدارة محتوى موقع Nexus Arab
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div
            key={card.label}
            className="glass rounded-2xl p-5"
            style={{ border: '1px solid var(--c-border)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${card.color}22` }}
            >
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <p className="text-3xl font-black mb-1" style={{ color: 'var(--c-text)' }}>{card.value}</p>
            <p className="text-xs" style={{ color: 'var(--c-text3)' }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="glass rounded-2xl p-6" style={{ border: '1px solid var(--c-border)' }}>
        <h2 className="font-bold mb-4" style={{ color: 'var(--c-text)' }}>إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'إضافة مشروع',   href: '/admin/projects/new' },
            { label: 'إضافة خدمة',    href: '/admin/services/new' },
            { label: 'إضافة قسم',     href: '/admin/categories/new' },
            { label: 'تعديل الإعدادات', href: '/admin/settings' },
          ].map(a => (
            <a
              key={a.label}
              href={a.href}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 text-white"
              style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
