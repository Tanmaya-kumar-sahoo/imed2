import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  console.log("=== DEBUG SESSION ENDPOINT ===");
  
  try {
    // Log request headers
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Try to get session
    console.log("Attempting to get server session...");
    const session = await getServerSession(authOptions);
    
    console.log("Session result:", session);
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session,
      user: session?.user || null,
      headers: Object.fromEntries(req.headers.entries())
    });
    
  } catch (error) {
    console.error("Error in debug session:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 