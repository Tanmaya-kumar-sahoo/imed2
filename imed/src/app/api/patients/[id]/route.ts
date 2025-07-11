import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const id = Number(context.params.id);
  const data = await req.json();
  // Only allow updating health profile fields
  const updateFields: any = {};
  if ('height' in data) updateFields.height = data.height;
  if ('weight' in data) updateFields.weight = data.weight;
  if ('bloodType' in data) updateFields.bloodType = data.bloodType;
  if ('allergies' in data) updateFields.allergies = data.allergies;
  if ('chronicConditions' in data) updateFields.chronicConditions = data.chronicConditions;
  if ('medications' in data) updateFields.medications = data.medications;
  await db.update(patients).set(updateFields).where(eq(patients.id, id));
  const updated = await db.select().from(patients).where(eq(patients.id, id)).get();
  return NextResponse.json({ success: true, patient: updated });
} 