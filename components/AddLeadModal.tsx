"use client";

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';

interface AddLeadModalProps {
  /**
   * Callback invoked after a lead is successfully inserted. The parent
   * component should refresh its lead list in this callback.
   */
  onLeadAdded: () => Promise<void>;
}

export default function AddLeadModal({ onLeadAdded }: AddLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseBrowser();
    await supabase.from('leads').insert({
      name: form.name,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      status: 'new',
    });
    setLoading(false);
    setOpen(false);
    setForm({ name: '', company: '', email: '', phone: '' });
    await onLeadAdded();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-5 py-2 text-white font-medium shadow-md hover:from-green-400 hover:to-teal-400 transition-colors"
      >
        Tilføj lead
      </button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[#0d1333] text-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nyt lead</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Navn</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md bg-gray-700/60 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Kontaktpersonens navn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Virksomhed</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md bg-gray-700/60 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Firmanavn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md bg-gray-700/60 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="kontakt@eksempel.dk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md bg-gray-700/60 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="12345678"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-gray-500 px-4 py-2 text-gray-300 hover:bg-gray-700/50"
                >
                  Annuller
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-5 py-2 text-white font-medium shadow-md disabled:opacity-50"
                >
                  {loading ? 'Gemmer…' : 'Gem lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}