"use client";

import { useState } from 'react';
import LeadBoard from '@/components/LeadBoard';
import LeadsTable from '@/components/LeadsTable';
import AddLeadModal from '@/components/AddLeadModal';
import type { Lead } from '@/components/LeadBoard';
import { getSupabaseBrowser } from '@/lib/supabase';

interface DashboardClientProps {
  initialLeads: Lead[];
  userId: string;
}

export default function DashboardClient({ initialLeads, userId }: DashboardClientProps) {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const refresh = async () => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setLeads(data ?? []);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lead‑dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('kanban')}
            className={`rounded px-3 py-1 text-sm font-medium ${
              view === 'kanban' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView('table')}
            className={`rounded px-3 py-1 text-sm font-medium ${
              view === 'table' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tabel
          </button>
        </div>
      </div>
      {view === 'kanban' ? (
        <LeadBoard leads={leads} refresh={refresh} />
      ) : (
        <LeadsTable leads={leads} refresh={refresh} />
      )}
      {/* Add Lead Modal & button */}
      <AddLeadModal userId={userId} onLeadAdded={refresh} />
    </div>
  );
}
