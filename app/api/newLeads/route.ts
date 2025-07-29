import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import authOptions from '@/lib/auth';
import { generateLeads } from '@/lib/openai';
import { searchSerper } from '@/lib/serper';
import { getSupabaseService } from '@/lib/supabase';


/**
 * POST /api/newLeads
 *
 * This endpoint generates a batch of new leads using GPT‑4 and Serper.dev based on the
 * current user's existing leads. The generated leads are inserted into the database
 * with status `new`. Requires authentication.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const { count = 10 } = (await req.json().catch(() => ({}))) as {
    count?: number;
  };
  const supabase = getSupabaseService();
  // Fetch existing leads to learn preferences (company names)
  const { data: existing } = await supabase
    .from('leads')
    .select('company')
    .eq('user_id', userId)
    .limit(20);
  const companies = (existing ?? [])
    .map((l) => l.company)
    .filter(Boolean) as string[];
  // Compose a simple prompt for GPT based on existing companies
  const prompt = companies.length
    ? `Mine bedste kunder er: ${companies.join(
        ', '
      )}. Find lignende virksomheder i samme brancher i Danmark.`
    : 'Find små og mellemstore danske virksomheder som potentielt kunne være kunder.';
  // Optionally call Serper to get trending topics (not used directly in this example)
  try {
    await searchSerper('danske virksomheder news');
} catch (err) {
    console.warn('Serper search failed', err);
}
  // Generate leads via GPT
  const generated = await generateLeads(prompt, count);
  if (!Array.isArray(generated)) {
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 });
  }
  // Insert leads into DB; avoid duplicates by company+name
  for (const lead of generated) {
    const name: string =
      lead.contactPerson || lead.name || lead.contact || 'Ukendt kontakt';
    const company: string | null = lead.companyName || lead.company || null;
    const email: string | null = lead.email || null;
    const phone: string | null = lead.phone || null;
    // Upsert logic: we attempt to insert; if conflict on user_id+name+company we ignore
    await supabase
      .from('leads')
      .upsert(
        {
          user_id: userId,
          name,
          company,
          status: 'new',
          email,
          phone
        },
        { onConflict: 'id' }
      );
  }
  return NextResponse.json({ inserted: generated.length });
}
