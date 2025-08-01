import NextAuth from 'next-auth';
import authoptions from '@/lib/auth';

const handler = NextAuth(authoptions);

export { handler as GET, handler as POST };
