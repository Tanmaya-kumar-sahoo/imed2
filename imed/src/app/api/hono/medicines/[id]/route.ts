import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicines } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/hono/medicines/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [med] = await db.select().from(medicines).where(eq(medicines.id, params.id));
    if (!med) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(med);
  } catch (err) {
    console.error('Hono GET /medicines/:id error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT /api/hono/medicines/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await db.update(medicines).set(body).where(eq(medicines.id, params.id));
    const [updated] = await db.select().from(medicines).where(eq(medicines.id, params.id));
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Hono PUT /medicines/:id error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE /api/hono/medicines/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(medicines).where(eq(medicines.id, params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Hono DELETE /medicines/:id error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export const runtime = 'edge'; 