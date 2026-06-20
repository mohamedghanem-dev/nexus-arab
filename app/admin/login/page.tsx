'use client';
// app/admin/login/page.tsx
import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error('بيانات الدخول غير صحيحة');
    } else {
      toast.success('تم تسجيل الدخول');
      window.location.href = '/admin';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--c-bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/icons/icon-192x192.png" alt="Nexus Arab" width={64} height={64} className="rounded-2xl mb-3" />
          <h1 className="text-xl font-black" style={{ color: 'var(--c-text)' }}>Nexus Arab</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text3)' }}>لوحة التحكم</p>
        </div>

        <form
          onSubmit={login}
          className="glass rounded-2xl p-6 flex flex-col gap-4"
          style={{ border: '1px solid var(--c-border)' }}
        >
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--c-text3)' }}>كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--c-bg3)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
