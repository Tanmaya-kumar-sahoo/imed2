import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

function getErrorMessage(error: any): string {
  return (
    error?.message ||
    error?.cause?.message ||
    error?.cause?.proto?.message ||
    (typeof error === 'string' ? error : '') ||
    (typeof error?.toString === 'function' ? error.toString() : '') ||
    ''
  );
}

// Search patient by id or name
export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const name = searchParams.get('name');
  let result = null;
  if (id) {
    result = await db.select().from(patients).where(eq(patients.id, Number(id))).get();
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(null);
    }
  } else if (name) {
    // Case-insensitive, partial match
    const nameQuery = `%${name.toLowerCase()}%`;
    const results = await db
      .select()
      .from(patients)
      .where(sql`lower(${patients.name}) LIKE ${nameQuery}`);
    return NextResponse.json(results);
  }
  return NextResponse.json(null);
}

// Create new patient
export async function POST(req: any) {
  const data = await req.json();
  try {
    // Check for existing phone
    const existingPhone = await db.select().from(patients).where(eq(patients.phone, data.phone)).get();
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered to another patient.' },
        { status: 400 }
      );
    }
    // Insert new patient
    await db.insert(patients).values(data);
    const [created] = await db.select().from(patients).orderBy(desc(patients.id)).limit(1);
    return NextResponse.json({ success: true, patient: created });
  } catch (error: any) {
    console.error('Unexpected error creating patient:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while creating the patient. Please try again or contact support.' },
      { status: 500 }
    );
  }
} 