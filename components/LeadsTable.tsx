"use client";

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

interface LeadsTableProps {
  leads: Lead[];
  refresh: () => Promise<void>;
}

export default function LeadsTable({ leads, refresh }: LeadsTableProps) {
  const statuses = [
    'new',
    'contacted',
    'interested',
    'negotiation',
    'won',
    'lost'
  ];
  const badgeColors: Record<string, string> = {
    new: 'bg-status-new',
    contacted: 'bg-status-contacted',
    interested: 'bg-status-interested',
    negotiation: 'bg-status-negotiation',
    won: 'bg-status-won',
    lost: 'bg-status-lost'
  };

  async function cycleStatus(lead: Lead) {
    const idx = statuses.indexOf(lead.status);
    const newStatus = statuses[(idx + 1) % statuses.length];
    const supabase = getSupabaseBrowser();
    await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', lead.id);
    await refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
              Navn
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
              Virksomhed
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
              Sidst kontakt
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
              Næste opgave
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
              Varmekategori
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-sm font-medium text-gray-900">
                {lead.name}
              </td>
              <td className="px-3 py-2 text-sm text-gray-700">
                {lead.company ?? '-'}
              </td>
              <td className="px-3 py-2 text-sm">
                <button
                  onClick={() => cycleStatus(lead)}
                  className={`inline-block rounded px-2 py-1 text-xs font-semibold text-white ${badgeColors[lead.status]}`}
                >
                  {lead.status}
                </button>
              </td>
              <td className="px-3 py-2 text-sm text-gray-700">
                {lead.last_contact_date
                  ? new Date(lead.last_contact_date).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-3 py-2 text-sm text-gray-700">
                {lead.next_task_date
                  ? new Date(lead.next_task_date).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-3 py-2 text-sm text-gray-700">
                {lead.warm_category ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
