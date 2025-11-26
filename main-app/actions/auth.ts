'use server';

import { request } from '@arcjet/next';
import { protectApiRules, protectContentCreation, protectFileUpload, protectSignInRules, protectSignUpRules, protectUserActions } from '@/arcject';

// Generic protection function
async function protectWithRules(
  rules: any, 
  options?: { 
    email?: string; 
    userId?: string;
    requested?: number;
  }
) {
  const req = await request();
  
  const decision = await rules.protect(req, {
    email: options?.email,
    userId: options?.userId,
    requested: options?.requested || 1,
  });

  return decision;
}

// 1. Sign Up Protection
export const protectSignUp = async (email: string) => {
  const decision = await protectWithRules(protectSignUpRules, { email });

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailTypes = decision.reason.emailTypes;
      if (emailTypes.includes('DISPOSABLE')) {
        return {
          error: 'Disposable emails are not allowed',
          success: false,
          status: 403
        };
      } else if (emailTypes.includes('INVALID')) {
        return {
          error: 'Invalid email address!',
          success: false,
          status: 403
        };
      } else if (emailTypes.includes('NO_MX_RECORDS')) {
        return {
          error: 'Email domain does not have valid MX records. Please try with a different email!',
          success: false,
          status: 403
        };
      }
    } else if (decision.reason.isBot()) {
      return {
        error: 'Bot activity detected!',
        success: false,
        status: 403
      };
    } else if (decision.reason.isRateLimit()) {
      return {
        error: 'Too many signup attempts! Please try again in 15 minutes.',
        success: false,
        status: 429
      };
    }
  }

  return { success: true };
};

// 2. Sign In Protection (using tokenBucket instead of protectSignin)
export const protectSignIn = async (email?: string) => {
  const decision = await protectWithRules(protectSignInRules, { email });

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return {
        error: 'Bot activity detected!',
        success: false,
        status: 403
      };
    } else if (decision.reason.isRateLimit()) {
      return {
        error: 'Too many login attempts! Please try again in 5 minutes.',
        success: false,
        status: 429
      };
    }
  }

  return { success: true };
};

export const protectVerification = async (email?: string) => {
  const decision = await protectWithRules(protectSignInRules, { email });

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return {
        error: 'Bot activity detected!',
        success: false,
        status: 403
      };
    } else if (decision.reason.isRateLimit()) {
      return {
        error: 'Too many verification attempts! Please try again in 5 minutes.',
        success: false,
        status: 429
      };
    }
  }

  return { success: true };
};

// 3. API Protection
export const protectApi = async (endpoint?: string) => {
  const decision = await protectWithRules(protectApiRules);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return {
        error: `Rate limit exceeded for ${endpoint || 'this endpoint'}. Please try again later.`,
        success: false,
        status: 429
      };
    } else if (decision.reason.isBot()) {
      return {
        error: 'Bot activity detected!',
        success: false,
        status: 403
      };
    }
  }

  return { success: true };
};

// 4. User Action Protection
export const protectUserAction = async (userId: string, action: string) => {
  const decision = await protectWithRules(protectUserActions, { userId });

  if (decision.isDenied()) {
    return {
      error: `You've performed too many ${action} actions. Please try again later.`,
      success: false,
      status: 429
    };
  }

  return { success: true };
};

// 5. File Upload Protection
export const protectFileUploadAction = async (userId?: string) => {
  const decision = await protectWithRules(protectFileUpload, { userId });

  if (decision.isDenied()) {
    return {
      error: 'Too many file uploads! Please try again in 5 minutes.',
      success: false,
      status: 429
    };
  }

  return { success: true };
};

// 6. Content Creation Protection
export const protectContentCreationAction = async (userId: string, contentType: string) => {
  const decision = await protectWithRules(protectContentCreation, { userId });

  if (decision.isDenied()) {
    return {
      error: `You've created too many ${contentType}s recently. Please try again later.`,
      success: false,
      status: 429
    };
  }

  return { success: true };
};

// 7. Generic protection for any endpoint
export const protectEndpoint = async (
  type: 'signup' | 'signin' | 'api' | 'public' | 'user' | 'upload' | 'content',
  options?: { email?: string; userId?: string; endpoint?: string; contentType?: string }
) => {
  switch (type) {
    case 'signup':
      return await protectSignUp(options?.email!);
    case 'signin':
      return await protectSignIn(options?.email);
    case 'api':
      return await protectApi(options?.endpoint);
    case 'user':
      return await protectUserAction(options?.userId!, options?.endpoint!);
    case 'upload':
      return await protectFileUploadAction(options?.userId);
    case 'content':
      return await protectContentCreationAction(options?.userId!, options?.contentType!);
    case 'public':
    default:
      return await protectApi(options?.endpoint);
  }
};