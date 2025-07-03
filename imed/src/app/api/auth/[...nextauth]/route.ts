import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the handler
const handler = NextAuth(authOptions);

// Export the handlers for Next.js App Router
export { handler as GET, handler as POST };

// Log that this file is being loaded for debugging
console.log("NextAuth API route loaded"); 