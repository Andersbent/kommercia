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
  // Upsert each lead into the ai_leads table. We use upsert on
  // user_id and company to avoid duplicates across runs.
  let inserted = 0;
  for (const lead of generated) {
    const { company, website, contactPerson, email, phone } = lead;
    if (!company) continue;
    const { error } = await supabase
      .from('ai_leads')
      .upsert(
        {
          user_id: userId,
          company,
          website: website ?? null,
          contact_person: contactPerson ?? null,
          email: email ?? null,
          phone: phone ?? null,
        },
        { onConflict: 'user_id,company' }
      );
    if (!error) inserted++;
  }
  return NextResponse.json({ inserted });
}