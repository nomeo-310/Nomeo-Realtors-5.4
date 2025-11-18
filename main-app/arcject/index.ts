import arcjet, { protectSignup, tokenBucket, shield, detectBot } from "@arcjet/next";

const baseConfig = {
  key: process.env.ARCJET_KEY || '',
  characteristics: ["ip.src"],
};

// 1. Sign Up Protection (Strict)
export const protectSignUpRules = arcjet({
  ...baseConfig,
  rules: [
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        allow: [],
      },
      rateLimit: {
        mode: "LIVE",
        interval: "15m", // 15 minutes
        max: 3, // 3 signups per 15 minutes
      },
    }),
  ],
});

// 2. Sign In Protection (Strict - prevent brute force)
export const protectSignInRules = arcjet({
  ...baseConfig,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // No bots allowed for signin
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // 5 login attempts
      interval: 300, // per 5 minutes (300 seconds)
      capacity: 8,
    }),
  ],
});

// 3. General API Protection (Moderate)
export const protectApiRules = arcjet({
  ...baseConfig,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 60, // 60 requests
      interval: 60, // per minute
      capacity: 100,
    }),
  ],
});

// 4. Public Endpoints (More generous)
export const protectPublicRules = arcjet({
  ...baseConfig,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 1000, // 1000 requests
      interval: 3600, // per hour
      capacity: 2000,
    }),
  ],
});

// 5. User-specific actions (Rate limit by user ID)
export const protectUserActions = arcjet({
  ...baseConfig,
  characteristics: ["user.id"], // Rate limit by user ID
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 100, // 100 actions
      interval: 3600, // per hour
      capacity: 200,
    }),
  ],
});

// 6. File Upload Protection
export const protectFileUpload = arcjet({
  ...baseConfig,
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // 10 uploads
      interval: 300, // per 5 minutes
      capacity: 15,
    }),
  ],
});

// 7. Comment/Post Creation Protection
export const protectContentCreation = arcjet({
  ...baseConfig,
  characteristics: ["user.id"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 30, // 30 posts/comments
      interval: 3600, // per hour
      capacity: 50,
    }),
  ],
});