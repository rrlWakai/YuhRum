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
    <main className="min-h-screen bg-petal flex flex-col justify-center px-6 py-16 text-plum md:px-10 font-body">
      <div className="mx-auto w-full max-w-md border border-blush/20 bg-white p-10 shadow-2xl shadow-plum/5">
        <div className="flex justify-center mb-8">
          <img src={yuhrumLogo} alt="Yuhrum Villas" className="h-10 w-auto object-contain" />
        </div>
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-shadow/60">Admin Portal</p>
        <h1 className="mt-3 text-center font-display italic text-3xl text-plum">Secure Access</h1>

        <form onSubmit={handleLogin} className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-shadow/80">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-blush/10 bg-petal px-4 py-3.5 text-sm outline-none focus:border-blush transition-colors text-plum"
              placeholder="admin@yuhrum.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-shadow/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-blush/10 bg-petal px-4 py-3.5 text-sm outline-none focus:border-blush transition-colors text-plum"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="mt-6 w-full bg-plum text-petal px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] transition-all hover:bg-shadow disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">{error}</p>}
      </div>
    </main>
  );
}
