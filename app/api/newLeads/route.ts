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
  // We only allow a single whitelisted user in this MVP, so we do not rely on
  // a numeric or UUID user identifier. Instead we insert leads without a
  // user_id to avoid type mismatches when the Google provider's `sub`
  // property (a long numeric string) cannot be cast to a Postgres UUID.
  const supabase = getSupabaseService();
  // Invoke the AI to generate a list of leads. This call may take
  // several seconds as it contacts OpenAI.
  const generated = await generateAILeads();
  if (!Array.isArray(generated) || generated.length === 0) {
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 });
  }
  // Insert each generated lead into the existing `leads` table. We use
  // upsert on name and company to avoid duplicates. The `user_id` field is
  // intentionally omitted because the NextAuth `user.id` from the Google
  // provider is not a valid Postgres UUID. In a multi‑user setup you
  // should instead add a `user_email` column or fetch the Supabase auth
  // UUID via `auth.uid()`.
  let inserted = 0;
  for (const lead of generated) {
    // Some AI responses may use either camelCase (contactPerson) or snake_case (contact_person).
    // Cast to any to avoid TypeScript complaints about unknown properties.
    const name: string = (lead as any).contactPerson || (lead as any).contact_person || 'Ukendt kontakt';
    const company: string | null = (lead.company as any) || null;
    const email: string | null = (lead.email as any) || null;
    const phone: string | null = (lead.phone as any) || null;
    // Only insert if a company name is provided
    if (!company) continue;
    const { error } = await supabase
      .from('leads')
      .upsert(
        {
          name,
          company,
          status: 'new',
          email,
          phone,
        },
        { onConflict: 'name,company' }
      );
    if (!error) inserted++;
  }
  return NextResponse.json({ inserted });
}