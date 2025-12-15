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
    userId?: string;
    redirectTo?: string; // Add this
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
      redirectTo?: string; // Add this
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
          if (!user) {
            throw new Error('Invalid email or password');
          }

          // 2. Check if user has admin role
          if (!['admin', 'creator', 'superAdmin'].includes(user.role)) {
            throw new Error('Access denied. Admin privileges required.');
          }

          // 3. Find admin record
          const admin = await getAdminByUserId(user._id);
          if (!admin) {
            throw new Error('Admin account not found');
          }

          if (admin.isSuspended) {
            throw new Error(`account_suspended_${user.role}`)
          }

          // 4. Check if admin is activated
          if (!admin.isActive && admin.deactivated) {
            throw new Error(`account_deactivated_${user.role}`);
          }

          // 5. Verify password - check both user and admin passwords
          let passwordMatch = false;

          // First check user password
          if (user.password) {
            passwordMatch = await bcryptjs.compare(password, user.password);
          }

          // If user password doesn't match, check admin password
          if (!passwordMatch && admin.password) {
            passwordMatch = await bcryptjs.compare(password, admin.password);
          }

          if (!passwordMatch) {
            throw new Error('Invalid email or password');
          }

          // Determine redirect URL based on role
          const redirectTo = getRedirectUrlByRole(user.role);

          // Return with both user and admin IDs
          return {
            id: admin._id.toString(),
            adminId: admin._id.toString(),
            userId: user._id.toString(),
            name: `${user.surName || ''} ${user.lastName || ''}`.trim() || user.email,
            email: user.email,
            role: user.role,
            redirectTo, // Add redirect URL
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
  pages: { 
    signIn: '/',
    signOut: '/',
    error: '/?error=', // Better error handling
  },
  session: { 
    strategy: 'jwt', 
    maxAge: 24 * 60 * 60 // 24 hours
  },
  jwt: { 
    secret: process.env.NEXTAUTH_SECRET, 
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; 
        token.adminId = user.adminId;
        token.userId = user.userId;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.redirectTo = (user as any).redirectTo; // Pass redirect URL
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
          role: token.role as 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin',
          redirectTo: token.redirectTo as string, // Add to session
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If redirecting to login page but user is authenticated, redirect to dashboard
      if (url.includes('/?callbackUrl=')) {
        // Extract the callbackUrl from the URL
        const urlObj = new URL(url, baseUrl);
        const callbackUrl = urlObj.searchParams.get('callbackUrl');
        
        if (callbackUrl) {
          // Return the decoded callbackUrl
          return decodeURIComponent(callbackUrl);
        }
      }
      
      // Default: redirect to the provided URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  // Add these for better control
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}

// Helper function to get redirect URL based on role
function getRedirectUrlByRole(role: string): string {
  const redirectMap: Record<string, string> = {
    superAdmin: '/superadmin-dashboard',
    admin: '/admin-dashboard',
    creator: '/creator-dashboard',
  };
  
  return redirectMap[role] || '/admin-dashboard';
}