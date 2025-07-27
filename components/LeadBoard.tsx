"use client";

import { useCallback } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';

export type Lead = {
  id: string;
  user_id: string;
  name: string;
  company?: string | null;
  status: string;
  last_contact_date?: string | null;
  next_task_date?: string | null;
  warm_category?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

interface LeadBoardProps {
  leads: Lead[];
  refresh: () => Promise<void>;
}

/**
 * Displays leads grouped into a simple Kanban board by status. Users can click a status badge
 * to cycle through statuses; the change is persisted via Supabase and refreshes the board.
 */
export default function LeadBoard({ leads, refresh }: LeadBoardProps) {
  const statuses = [
    'new',
    'contacted',
    'interested',
    'negotiation',
    'won',
    'lost'
  ];

  const statusOrder: Record<string, number> = {
    new: 0,
    contacted: 1,
    interested: 2,
    negotiation: 3,
    won: 4,
    lost: 5
  };

  const grouped: Record<string, Lead[]> = {};
  statuses.forEach((s) => (grouped[s] = []));
  for (const lead of leads) {
    grouped[lead.status] = grouped[lead.status] ?? [];
    grouped[lead.status].push(lead);
  }

  const handleCycleStatus = useCallback(
    async (lead: Lead) => {
      const currentIndex = statusOrder[lead.status];
      const newStatus = statuses[(currentIndex + 1) % statuses.length];
      const supabase = getSupabaseBrowser();
      await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id);
      await refresh();
    },
    [refresh, statuses, statusOrder]
  );

  const badgeColors: Record<string, string> = {
    new: 'bg-status-new',
    contacted: 'bg-status-contacted',
    interested: 'bg-status-interested',
    negotiation: 'bg-status-negotiation',
    won: 'bg-status-won',
    lost: 'bg-status-lost'
  };

  return (
    <div className="flex w-full overflow-x-auto space-x-4">
      {statuses.map((status) => (
        <div
          key={status}
          className="min-w-[250px] flex-1 bg-white rounded-md shadow p-3"
        >
          <h3
            className={`mb-2 capitalize font-semibold text-sm text-white px-2 py-1 rounded ${badgeColors[status]}`}
          >
            {status}
          </h3>
          <div className="space-y-2">
            {grouped[status]?.map((lead) => (
              <div
                key={lead.id}
                className="rounded border p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleCycleStatus(lead)}
              >
                <div className="font-medium">{lead.name}</div>
                {lead.company && (
                  <div className="text-sm text-gray-500">{lead.company}</div>
                )}
                {lead.last_contact_date && (
                  <div className="text-xs text-gray-400 mt-1">
                    Sidst kontakt:{' '}
                    {new Date(lead.last_contact_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
