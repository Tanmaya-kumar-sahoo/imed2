import { NextResponse } from 'next/server';
import { saveRecommendation } from '@/lib/services/turso-medicine-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // If the patient object is present, use its id as patientId
    const patientId = data.patient?.id;
    const session = await getServerSession(authOptions);
    const doctorId = session?.user?.id;
    const saved = await saveRecommendation({ ...data, patientId, doctorId });
    return NextResponse.json({ success: true, recommendation: saved });
  } catch (error) {
    console.error('Error verifying recommendation:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 