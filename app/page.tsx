import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import LoginButton from '@/components/LoginButton';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    // If the user is already authenticated redirect to dashboard
    redirect('/dashboard');
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-brand">Kommercia</h1>
      <p className="mt-4 max-w-xl text-lg">
        Your Commercial Department in the Cloud
      </p>
      <LoginButton />
    </main>
  );
}
