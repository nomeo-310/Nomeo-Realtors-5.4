import { AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongoDBClient'
import { loginSchema } from '@/lib/form-validations'
import { DefaultUser } from 'next-auth'
import { DefaultSession } from 'next-auth'
import { getUserByEmail } from '@/actions/user-actions'

declare module 'next-auth' {
  interface User extends DefaultUser {
    role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
    } & DefaultSession['user'];
  }
}

export const authOptions:AuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text'},
        password: {label: 'password', type: 'password'}, 
      },
      async authorize(credentials) {
        const { email, password } = loginSchema.parse(credentials);

        if (!email || !password) {
          throw new Error('Invalid Credentials');
        };

        const user = await getUserByEmail(email)

        if (!user || !user?.password) {
          throw new Error('Invalid Credentials')
        };

        const passwordMatch = await bcryptjs.compare(password, user.password);

        if (!passwordMatch) {
          throw new Error('Invalid Credentials')
        };

        if (user.userAccountDeleted) {
          throw new Error('Account no longer exists. Please create a new account to continue.')
        }

        if (user.userAccountSuspended) {
          throw new Error('Account suspended. Contact app admin for more instructions.')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {signIn: '/log-in'},
  session: {strategy: 'jwt', maxAge: 24 * 60 * 60},
  jwt: {secret: process.env.NEXTAUTH_SECRET, maxAge: 24 * 60 * 60},
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: session.user?.name,
          email: session.user?.email,
          role: token.role as 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin'
        };
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}