// app/admin/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cookies } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const allCookies = cookies().getAll();
  console.log('[admin-layout] cookie names:', allCookies.map(c => c.name));

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('[admin-layout] user:', user?.id, user?.email, 'error:', userError?.message);

  if (!user) {
    console.log('[admin-layout] NO USER -> redirecting to login');
    redirect('/admin/login');
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();
  console.log('[admin-layout] adminUser:', adminUser, 'adminError:', adminError?.message, adminError?.code);

  if (!adminUser) {
    console.log('[admin-layout] NOT ADMIN -> redirecting to login');
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--c-bg)', direction: 'rtl' }}>
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto p-6 md:mr-64">
        {children}
      </main>
    </div>
  );
}
