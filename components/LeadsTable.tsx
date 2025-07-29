"use client";

import { getSupabaseBrowser } from '@/lib/supabase';

/**
 * Definition of a lead record used by the table. This mirrors the shape
 * of the `leads` table in Supabase and includes additional fields for
 * email tracking such as `response_status` and `most_recent_subject`.
 */
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
  /** Latest email response status: 'responded', 'sent' or 'none' */
  response_status?: string | null;
  /** Subject line of the most recent email */
  most_recent_subject?: string | null;
};

interface LeadsTableProps {
  leads: Lead[];
  refresh: () => Promise<void>;
}

/**
 * A tabular view of leads including CRM fields and email tracking
 * information. Each lead row exposes an interactive badge allowing the
 * user to cycle through the CRM status values. Email statuses are
 * highlighted with colour‑coded badges to improve readability.
 */
export default function LeadsTable({ leads, refresh }: LeadsTableProps) {
  const statuses = ['new', 'contacted', 'interested', 'negotiation', 'won', 'lost'];
  const badgeColors: Record<string, string> = {
    new: 'bg-status-new',
    contacted: 'bg-status-contacted',
    interested: 'bg-status-interested',
    negotiation: 'bg-status-negotiation',
    won: 'bg-status-won',
    lost: 'bg-status-lost',
  };
  // Colours for email response status badges
  const emailStatusColors: Record<string, string> = {
    responded: 'bg-green-100 text-green-800',
    sent: 'bg-yellow-100 text-yellow-800',
    none: 'bg-gray-100 text-gray-800',
  };

  async function cycleStatus(lead: Lead) {
    const idx = statuses.indexOf(lead.status);
    const newStatus = statuses[(idx + 1) % statuses.length];
    const supabase = getSupabaseBrowser();
    await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);
    await refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Navn</th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Virksomhed</th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Sidst kontakt</th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Næste opgave</th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Varmekategori</th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">E‑mail status</th>
            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Seneste emne</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => {
            const emailStatus = (lead.response_status ?? 'none') as keyof typeof emailStatusColors;
            return (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">{lead.name}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{lead.company ?? '-'}</td>
                <td className="px-3 py-2 text-sm">
                  <button
                    onClick={() => cycleStatus(lead)}
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold text-white ${badgeColors[lead.status]}`}
                  >
                    {lead.status}
                  </button>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">
                  {lead.last_contact_date ? new Date(lead.last_contact_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">
                  {lead.next_task_date ? new Date(lead.next_task_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">{lead.warm_category ?? '-'}</td>
                <td className="px-3 py-2 text-sm">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${emailStatusColors[emailStatus]}`}
                  >
                    {lead.response_status ?? 'none'}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700 truncate max-w-xs">
                  {lead.most_recent_subject ?? '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}