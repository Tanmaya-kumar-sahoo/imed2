import { NextResponse } from 'next/server';
import { saveRecommendation } from '@/lib/services/turso-medicine-service';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const saved = await saveRecommendation(data);
    return NextResponse.json({ success: true, recommendation: saved });
  } catch (error) {
    console.error('Error verifying recommendation:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 