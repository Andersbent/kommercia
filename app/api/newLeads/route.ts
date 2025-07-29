import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { generateAILeads } from '@/lib/openai';
import { getSupabaseService } from '@/lib/supabase';

/**
 * POST /api/newLeads
 *
 * Generates a fresh batch of AI‑generated leads based on a fixed
 * market definition (B2B companies in Denmark or Northern Germany with
 * green, logistics or production profiles). Requires the user to be
 * authenticated via NextAuth. The returned leads are inserted into
 * the `ai_leads` table associated with the current user. Duplicate
 * entries for the same company/contact are avoided via an upsert on
 * user_id + company.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const supabase = getSupabaseService();
  // Invoke the AI to generate a list of leads. This call may take
  // several seconds as it contacts OpenAI.
  const generated = await generateAILeads();
  if (!Array.isArray(generated) || generated.length === 0) {
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 });
  }
  // Insert each generated lead into the existing `leads` table. We use
  // upsert on user_id, name and company to avoid duplicates. If the
  // `ai_leads` table exists in your Supabase database you can revert
  // this to that table instead.
  let inserted = 0;
  for (const lead of generated) {
    const name: string = lead.contactPerson || lead.contact_person || 'Ukendt kontakt';
    const company: string | null = (lead.company as any) || null;
    const email: string | null = (lead.email as any) || null;
    const phone: string | null = (lead.phone as any) || null;
    // Only insert if a company name is provided
    if (!company) continue;
    const { error } = await supabase
      .from('leads')
      .upsert(
        {
          user_id: userId,
          name,
          company,
          status: 'new',
          email,
          phone,
        },
        { onConflict: 'user_id,name,company' }
      );
    if (!error) inserted++;
  }
  return NextResponse.json({ inserted });
}