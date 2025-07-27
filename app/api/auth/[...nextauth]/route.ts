import NextAuth from 'next-auth';
import * as authModule from '@/lib/auth';

const handler = NextAuth(authModule.authoptions);

export { handler as GET, handler as POST };
