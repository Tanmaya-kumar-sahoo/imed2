import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { DefaultSession, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { compare } from "bcrypt";
import { getUserByEmail } from "./services/user-service";

console.log("Auth config loading...");

// Generate a fallback secret if none is provided (for development only)
const getNextAuthSecret = () => {
  if (process.env.NEXTAUTH_SECRET) {
    console.log("NEXTAUTH_SECRET exists: true");
    console.log("NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET.length);
    return process.env.NEXTAUTH_SECRET;
  }
  
  console.log("NEXTAUTH_SECRET exists: false");
  console.log("NEXTAUTH_SECRET length: 0");
  
  // For development, generate a temporary secret
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️  Using temporary secret for development. Set NEXTAUTH_SECRET in production!");
    return "dev-temp-secret-o56wCAqIq3v2hdbZl6UeTZQBcGKaaot1nt3ZacNBp0o";
  }
  
  throw new Error("NEXTAUTH_SECRET is required in production");
};

// Get the NextAuth URL with fallback
const getNextAuthUrl = () => {
  const url = process.env.NEXTAUTH_URL || "http://localhost:3000";
  console.log("NEXTAUTH_URL:", url);
  return url;
};

const NEXTAUTH_SECRET = getNextAuthSecret();
const NEXTAUTH_URL = getNextAuthUrl();

// Define the list of admin email addresses
const ADMIN_EMAILS = [
  "admin@example.com",
  "test@example.com", 
  "vtu22@example.com",
  "admin@imed.com",
  "koushikchodraju008@gmail.com" // Current user account
]; // Add your admin emails here

// Extend the session type to include role
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    id?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

// Define our NextAuth configuration
export const authOptions = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log("Authorize called with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }
        
        try {
          // Get user from database
          const user = await getUserByEmail(credentials.email as string);
          console.log("User found:", user ? "Yes" : "No");
          
          if (!user || !user.password) {
            console.log("No user or password found");
            return null;
          }
          
          // Check if password matches
          const isPasswordValid = await compare(credentials.password as string, user.password);
          console.log("Password valid:", isPasswordValid);
          
          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }
          
          // Return user object that will be saved in the JWT
          const authUser = {
            id: user.id,           // use user.id from DB
            uid: user.id,          // for your own code, if needed
            email: user.email,
            name: user.displayName,
            image: user.photoURL,
            role: user.role || "user"
          };
          
          console.log("Returning auth user:", authUser);
          return authUser;
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      console.log("JWT callback - token:", token);
      console.log("JWT callback - user:", user);
      
      // Add custom claims to the JWT
      if (user) {
        const isAdmin = ADMIN_EMAILS.includes(user.email || "");
        token.role = user.role || (isAdmin ? "admin" : "user");
        // Always set token.id from user.id or user.uid
        token.id = user.id || (user as any).uid;
        console.log("Updated token with user data:", { role: token.role, id: token.id });
      }
      return token;
    },
    session({ session, token }: { session: any; token: JWT }) {
      console.log("Session callback - session:", session);
      console.log("Session callback - token:", token);
      
      // Add role to the session
      if (session?.user) {
        session.user.role = token.role as string;
        // Always set session.user.id from token.id
        session.user.id = token.id as string;
        console.log("Updated session with token data:", { role: session.user.role, id: session.user.id });
      }
      return session;
    },
    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("Redirect callback - url:", url, "baseUrl:", baseUrl);
      // Handle redirects
      if (url.startsWith(baseUrl)) {
        return url;
      } else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === "development",
  secret: NEXTAUTH_SECRET,
};

// Create the NextAuth handler
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Helper to check if a user is an admin
export const isAdmin = (email: string) => ADMIN_EMAILS.includes(email); 