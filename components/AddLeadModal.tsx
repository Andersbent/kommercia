"use client";

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';

interface AddLeadModalProps {
  userId: string;
  onLeadAdded: () => Promise<void>;
}

export default function AddLeadModal({ userId, onLeadAdded }: AddLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    warm_category: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseBrowser();
    await supabase.from('leads').insert({
      user_id: userId,
      name: form.name,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      warm_category: form.warm_category || null
    });
    setLoading(false);
    setOpen(false);
    setForm({ name: '', company: '', email: '', phone: '', warm_category: '' });
    await onLeadAdded();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Tilføj lead
      </button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-md w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Nyt lead</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Navn</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder="Kontaktpersonens navn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Virksomhed</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder="Firmanavn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder="kontakt@eksempel.dk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Telefon</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Varmekategori</label>
                <input
                  name="warm_category"
                  value={form.warm_category}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder="Kold, lun eller varm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border px-4 py-2"
                >
                  Annuller
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-brand px-4 py-2 text-white disabled:opacity-50"
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
