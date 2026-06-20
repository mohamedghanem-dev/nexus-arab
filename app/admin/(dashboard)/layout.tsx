// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  // Verify admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) redirect('/admin/login');

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--c-bg)', direction: 'rtl' }}>
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto p-6 md:mr-64">
        {children}
      </main>
    </div>
  );
}
