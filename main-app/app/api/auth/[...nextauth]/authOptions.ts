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

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = loginSchema.parse(credentials);

        if (!email || !password) {
          throw new Error('invalid_credentials');
        };

        const user = await getUserByEmail(email)

        if (!user || !user?.password) {
          throw new Error('invalid_credentials')
        };

        if (user && !user.userVerified) {
          throw new Error('email_not_verified');
        }

        const passwordMatch = await bcryptjs.compare(password, user.password);

        if (user.userAccountDeleted) {
          if (user.deletedBy !== user._id.toString()) {
            throw new Error('account_deleted_by_admin');
          }

          if (user.deletedBy === user._id.toString()) {
            const deletionDate = new Date(user.deletedAt);
            const thirtyDaysAfterDeletion = new Date(deletionDate.getTime() + (30 * 24 * 60 * 60 * 1000));
            const currentDate = new Date();

            if (currentDate <= thirtyDaysAfterDeletion) {
              if (user.role === 'user') {
                throw new Error('account_deleted_by_self_user');
              }

              if (user.role === 'agent') {
                throw new Error('account_deleted_by_self_agent');
              }
            } else {
              throw new Error('invalid_credentials');
            }
          }
        }

        if (user.userAccountSuspended) {
          if (user.role === 'user') {
            throw new Error('account_suspended_user');
          }

          if (user.role === 'agent') {
            throw new Error('account_suspended_agent');
          }
        }

        if (!passwordMatch) {
          throw new Error('invalid_credentials')
        };

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/log-in',
    error: '/login-error',
  },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  jwt: { secret: process.env.NEXTAUTH_SECRET, maxAge: 24 * 60 * 60 },
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
    // Add signIn callback to handle redirects
    async signIn({ user, account, profile, email, credentials }) {
      if (user) {
        return true
      }
      return false
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}