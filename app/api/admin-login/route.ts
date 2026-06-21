// app/api/admin-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.log('[admin-login] signIn error:', error?.message);
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
  }

  console.log('[admin-login] signed in user.id:', data.user.id, 'email:', data.user.email);

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .single();

  console.log('[admin-login] adminUser:', JSON.stringify(adminUser), 'adminError:', JSON.stringify(adminError));

  if (!adminUser) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'هذا الحساب غير مصرح له بالدخول للوحة التحكم' }, { status: 403 });
  }

  return response;
}
