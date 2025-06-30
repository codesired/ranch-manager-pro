import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Environment variables validation
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Environment variable GOOGLE_CLIENT_ID not provided");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Environment variable GOOGLE_CLIENT_SECRET not provided");
}
if (!process.env.SESSION_SECRET) {
  throw new Error("Environment variable SESSION_SECRET not provided");
}

export function getSession() {
  const sessionTtl = 24 * 60 * 60 * 1000; // 24 hours
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl / 1000, // ttl expects seconds
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

interface GoogleProfile {
  id: string;
  emails: Array<{ value: string; verified: boolean }>;
  name: {
    givenName: string;
    familyName: string;
  };
  photos: Array<{ value: string }>;
}

interface GoogleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  accessToken: string;
  refreshToken?: string;
}

async function upsertUser(profile: GoogleProfile, accessToken: string, refreshToken?: string) {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error("No email found in Google profile");
  }

  // Check if this is a default admin account
  const defaultAdminEmails = process.env.DEFAULT_ADMIN_EMAILS?.split(',') || [];
  const isDefaultAdmin = defaultAdminEmails.includes(email);
  
  // Get existing user to preserve their current role if they already exist
  const existingUser = await storage.getUser(profile.id);
  
  const userData = {
    id: profile.id,
    email: email,
    firstName: profile.name?.givenName || '',
    lastName: profile.name?.familyName || '',
    profileImageUrl: profile.photos?.[0]?.value,
    // Set role: keep existing role, or set admin for default admins, or partner for new users
    role: existingUser?.role || (isDefaultAdmin ? 'admin' : 'partner'),
  };

  await storage.upsertUser(userData);
  
  return {
    ...userData,
    accessToken,
    refreshToken,
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    scope: ['profile', 'email'],
    accessType: 'offline', // To get refresh token
    prompt: 'consent', // To ensure refresh token is provided
  }, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done) => {
    try {
      const user = await upsertUser(profile, accessToken, refreshToken);
      return done(null, user);
    } catch (error) {
      console.error("Error during Google authentication:", error);
      return done(error, null);
    }
  }));

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      accessType: 'offline',
      prompt: 'consent'
    })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/login?error=auth_failed" 
    }),
    (req, res) => {
      // Successful authentication
      const returnTo = req.session?.returnTo || '/';
      delete req.session?.returnTo;
      res.redirect(returnTo);
    }
  );

  app.get("/api/auth/logout", (req, res) => {
    const returnTo = req.query.returnTo as string || '/';
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session?.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.clearCookie('connect.sid');
        res.redirect(returnTo);
      });
    });
  });

  // Get current user info
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    // Store the original URL for redirect after login
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      req.session!.returnTo = req.originalUrl;
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Update user last active time
  try {
    await storage.updateUserLastActive((req.user as any).id);
  } catch (error) {
    console.warn("Failed to update user last active time:", error);
  }

  next();
};

export const requireRole = (roles: string[]): RequestHandler => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser((req.user as any).id);
    if (!dbUser || !roles.includes(dbUser.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    (req as any).dbUser = dbUser;
    next();
  };
};

// Utility function to check if user has specific role
export const hasRole = (user: any, role: string): boolean => {
  return user?.role === role;
};

// Utility function to check if user has any of the specified roles
export const hasAnyRole = (user: any, roles: string[]): boolean => {
  return user?.role && roles.includes(user.role);
};