import { AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { DefaultUser } from 'next-auth'
import { DefaultSession } from 'next-auth'
import clientPromise from '@/utils/mongoDBClient'
import { loginSchema } from '@/utils/form-validations'
import { getAdminByUserId, getUserByEmail } from '@/actions/auth-actions'

declare module 'next-auth' {
  interface User extends DefaultUser {
    role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
    adminId?: string;
    userId?: string; // Add userId for reference
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      adminId?: string;
      userId?: string;
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
        try {
          const { email, password } = loginSchema.parse(credentials);

          if (!email || !password) {
            throw new Error('Email and password are required');
          }

          // 1. Find user by email
          const user = await getUserByEmail(email);
          if (!user || !user?.password) {
            throw new Error('Invalid email or password');
          }

          // 2. Verify USER password
          const userPasswordMatch = await bcryptjs.compare(password, user.password);
          if (!userPasswordMatch) {
            throw new Error('Invalid email or password');
          }

          // 3. Check if user has admin role
          if (!['admin', 'creator', 'superAdmin'].includes(user.role)) {
            throw new Error('Access denied. Admin privileges required.');
          }

          // 4. Find admin record
          const admin = await getAdminByUserId(user._id);
          if (!admin) {
            throw new Error('Admin account not found');
          }

          // 5. Verify ADMIN password (this ensures it's the actual admin)
          if (admin.password) {
            const adminPasswordMatch = await bcryptjs.compare(password, admin.password);
            if (!adminPasswordMatch) {
              throw new Error('Admin authentication failed');
            }
          } else {
            // If admin doesn't have password, it might be a newly created admin
            // You can choose to allow login or require password setup
            throw new Error('Admin password not set. Please contact administrator.');
          }

          // 6. Check if admin is activated
          if (!admin.isActivated) {
            throw new Error('Admin account is deactivated');
          }

          // Return with both user and admin IDs
          return {
            id: admin._id.toString(),
            adminId: admin._id.toString(),
            userId: user._id.toString(),
            name: `${user.surName} ${user.lastName}`,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  pages: { signIn: '/' },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  jwt: { secret: process.env.NEXTAUTH_SECRET, maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; 
        token.adminId = user.adminId;
        token.userId = user.userId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          adminId: token.adminId as string,
          userId: token.userId as string, 
          name: token.name as string,
          email: token.email as string,
          role: token.role as 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin'
        };
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}