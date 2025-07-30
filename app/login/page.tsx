"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';

/**
 * A simple login page that authenticates a user via Supabase email/password.
 * On successful login the user is redirected to the dashboard. Errors are
 * displayed below the form. The design follows the dark, modern theme
 * inspired by the provided style reference.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('agent@kommercia.ai');
  const [password, setPassword] = useState('AgentTest123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2145] via-[#1c254b] to-[#16223d] flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#0d1333]/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Log ind</h1>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-gray-700/60 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Adgangskode
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-gray-700/60 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-5 py-2 font-medium text-white shadow-md disabled:opacity-50"
        >
          {loading ? 'Logger ind…' : 'Log ind'}
        </button>
      </form>
    </div>
  );
}