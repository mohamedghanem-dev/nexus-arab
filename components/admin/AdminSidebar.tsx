'use client';
// components/admin/AdminSidebar.tsx
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, Tags, Briefcase,
  Star, Settings, MessageSquare, LogOut, ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const MENU = [
  { href: '/admin',              label: 'الرئيسية',      icon: LayoutDashboard },
  { href: '/admin/projects',     label: 'المشاريع',      icon: FolderOpen },
  { href: '/admin/categories',   label: 'الأقسام',       icon: Tags },
  { href: '/admin/services',     label: 'الخدمات',       icon: Briefcase },
  { href: '/admin/testimonials', label: 'آراء العملاء',  icon: Star },
  { href: '/admin/messages',     label: 'الرسائل',       icon: MessageSquare },
  { href: '/admin/settings',     label: 'الإعدادات',     icon: Settings },
];

interface Props { userEmail: string; }

export function AdminSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('تم تسجيل الخروج');
    router.push('/admin/login');
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 w-64 flex flex-col z-40 glass"
      style={{ borderLeft: '1px solid var(--c-border)' }}
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <Image src="/icons/icon-192x192.png" alt="Nexus Arab" width={36} height={36} className="rounded-xl" />
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>Nexus Arab</p>
          <p className="text-xs" style={{ color: 'var(--c-text3)' }}>لوحة التحكم</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-3">
        {MENU.map(item => {
          const Icon    = item.icon;
          const active  = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all"
              style={{
                background: active ? 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(6,182,212,0.1))' : 'transparent',
                color:      active ? 'var(--c-accent-lt)' : 'var(--c-text2)',
                border:     active ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
              }}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
              {active && <ChevronRight size={14} className="mr-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4" style={{ borderTop: '1px solid var(--c-border)' }}>
        <p className="text-xs mb-3 truncate" style={{ color: 'var(--c-text3)' }}>{userEmail}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
