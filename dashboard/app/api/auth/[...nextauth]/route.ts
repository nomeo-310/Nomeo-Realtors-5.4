import NextAuth from 'next-auth'
import { authOptions } from './authOptions'

const handler = NextAuth({...authOptions,
    pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
});

export { handler as GET, handler as POST };