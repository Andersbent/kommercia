// Triggering Vercel rebuild

"use client";

import { useState } from 'react';
import LeadBoard from '@/components/LeadBoard';
import LeadsTable from '@/components/LeadsTable';
import AddLeadModal from '@/components/AddLeadModal';
import type { Lead } from '@/components/LeadBoard';
import { getSupabaseBrowser } from '@/lib/supabase';

interface DashboardClientProps {
  /**
   * The initial batch of leads fetched server‑side. Since the MVP only
   * supports a single user, we do not differentiate by user ID.
   */
  initialLeads: Lead[];
}

export default function DashboardClient({ initialLeads }: DashboardClientProps) {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  // Track whether AI lead generation is currently in progress
  const [generating, setGenerating] = useState(false);

  const refresh = async () => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    setLeads(data ?? []);
  };

  /**
   * Handler that triggers the AI lead generation endpoint. When invoked it
   * issues a POST request to `/api/newLeads`. While the request is in
   * progress a loading state is shown. After completion the dashboard
   * refreshes its data. Errors are logged to the console for debugging.
   */
  const handleGenerateLeads = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/newLeads', { method: 'POST' });
      const data = await res.json();
      console.log('Leads genereret:', data);
    } catch (err) {
      console.error('Fejl ved generering:', err);
    } finally {
      setGenerating(false);
      await refresh();
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lead‑dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {/* View toggles */}
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
          {/* Generate leads button */}
          <button
            onClick={handleGenerateLeads}
            disabled={generating}
            className={`rounded px-3 py-1 text-sm font-medium ${
              generating ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {generating ? 'Genererer…' : 'Generér leads'}
          </button>
        </div>
      </div>
      {view === 'kanban' ? (
        <LeadBoard leads={leads} refresh={refresh} />
      ) : (
        <LeadsTable leads={leads} refresh={refresh} />
      )}
      {/* Add Lead Modal & button */}
      <AddLeadModal onLeadAdded={refresh} />
    </div>
  );
}
