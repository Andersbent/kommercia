import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }
  const userId = (session.user as any).id;
  const supabase = getSupabaseService();
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch leads', error);
  }
  return <DashboardClient initialLeads={leads ?? []} userId={userId} />;
}
