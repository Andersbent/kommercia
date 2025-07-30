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
    // Extract fields from the AI response. Some models may use camelCase or snake_case.
    const name: string = (lead as any).contactPerson || (lead as any).contact_person || 'Ukendt kontakt';
    const company: string | null = (lead.company as any) || null;
    const email: string | null = (lead.email as any) || null;
    const phone: string | null = (lead.phone as any) || null;
    // Skip leads without a company name.
    if (!company) continue;
    // Check if a lead with the same name and company already exists. Because the
    // `leads` table does not have a unique constraint on these columns, using
    // `upsert` with onConflict will fail. Instead we perform a simple lookup
    // and only insert if no existing row is found. We ignore any error from
    // the existence check and proceed to insert on error to avoid silently
    // skipping valid leads.
    try {
      const { data: existing, error: existErr } = await supabase
        .from('leads')
        .select('id')
        .eq('name', name)
        .eq('company', company)
        .maybeSingle();
      if (!existErr && existing) {
        // Row already exists, skip insertion.
        continue;
      }
    } catch (e) {
      // Ignore lookup errors and attempt to insert anyway.
    }
    const { error: insertError } = await supabase
      .from('leads')
      .insert({
        name,
        company,
        status: 'new',
        email,
        phone,
      });
    if (!insertError) inserted++;
  }
  return NextResponse.json({ inserted });
}