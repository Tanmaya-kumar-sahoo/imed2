import { NextResponse } from 'next/server';
import { getHistoryEntries } from '@/lib/services/history-store';

export async function GET() {
  const history = await getHistoryEntries();
  return NextResponse.json({ history });
} 