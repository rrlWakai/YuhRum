import { useState } from 'react';
import type { FormEvent } from 'react';
import yuhrumLogo from '../assets/yuhrumlogo.png';
import { useAuth } from '@/hooks/useAuth';

export function AdminLoginForm() {
  const { signIn, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F6F4] flex flex-col justify-center px-6 py-16 text-[#0A192F] md:px-10">
      <div className="mx-auto w-full max-w-md border border-gray-200 bg-white p-10 shadow-2xl shadow-black/5">
        <div className="flex justify-center mb-8">
          <img src={yuhrumLogo} alt="Yuhrum Villas" className="h-10 w-auto object-contain" />
        </div>
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-gray-500">Admin Portal</p>
        <h1 className="mt-3 text-center font-serif text-3xl text-[#0A192F]">Secure Access</h1>

        <form onSubmit={handleLogin} className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 bg-[#F7F6F4] px-4 py-3.5 text-sm outline-none focus:border-[#0A192F] transition-colors"
              placeholder="admin@yuhrum.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 bg-[#F7F6F4] px-4 py-3.5 text-sm outline-none focus:border-[#0A192F] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="mt-6 w-full btn-navy px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] transition-opacity disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">{error}</p>}
      </div>
    </main>
  );
}
