import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  createOrUpdateHealthProfile, 
  getHealthProfile, 
  deleteHealthProfile,
  UserHealthProfileInput 
} from "@/lib/services/turso-patient-service";

export async function GET(req: NextRequest) {
  console.log("GET /api/patient-presets - Starting...");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");
    console.log("Session user:", session?.user);
    
    if (!session?.user) {
      console.log("No session or user found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = (session.user as any).id ?? (session.user as any).uid ?? (session.user as any).sub ?? null;
    console.log("Extracted userId:", userId);
    
    if (!userId) {
      console.log("No userId found, returning empty profile");
      return NextResponse.json(null, { status: 200 });
    }
    
    const profile = await getHealthProfile(userId);
    console.log("Found health profile:", profile ? "Yes" : "No");
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in GET /api/patient-presets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("POST /api/patient-presets - Starting...");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");
    console.log("Session user:", session?.user);
    // Debug: print the full session user object
    console.log("Full session user object:", JSON.stringify(session?.user, null, 2));
    
    if (!session?.user) {
      console.log("No session or user found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    console.log("Request body:", body);
    
    const { height, weight, blood_type, allergies, chronic_conditions, medications } = body;
    
    const userId = (session.user as any).id ?? (session.user as any).uid ?? (session.user as any).sub;
    console.log("Extracted userId:", userId);
    
    if (!userId) {
      console.log("No userId found, returning error");
      return NextResponse.json({ error: "No user ID found" }, { status: 400 });
    }
    
    const healthProfileInput: UserHealthProfileInput = {
      user_id: userId,
      height: height || undefined,
      weight: weight || undefined,
      blood_type: blood_type || undefined,
      allergies: allergies || undefined,
      chronic_conditions: chronic_conditions || undefined,
      medications: medications || undefined,
    };
    
    const profile = await createOrUpdateHealthProfile(healthProfileInput);
    
    console.log("Created/updated health profile:", profile);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in POST /api/patient-presets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log("DELETE /api/patient-presets - Starting...");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");
    
    if (!session?.user) {
      console.log("No session or user found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = (session.user as any).id ?? (session.user as any).uid ?? (session.user as any).sub;
    console.log("Extracted userId:", userId);
    
    if (!userId) {
      console.log("No userId found, returning error");
      return NextResponse.json({ error: "No user ID found" }, { status: 400 });
    }
    
    await deleteHealthProfile(userId);
    console.log("Health profile deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/patient-presets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 