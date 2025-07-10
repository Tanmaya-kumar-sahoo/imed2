import { NextResponse } from 'next/server';
import { addHistoryEntry } from '@/lib/services/history-store';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Save only medicines, symptoms, and timestamp
    await addHistoryEntry({
      medicines: data.medicines,
      symptoms: data.symptoms,
      timestamp: data.timestamp,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 