import { NextResponse } from 'next/server';
import { db, executeSql } from '@/lib/db';
import { medicines } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

// GET  /api/hono/medicines  – list first 100 medicines
export async function GET() {
  try {
    const all = await db.select().from(medicines).limit(100);
    return NextResponse.json({ medicines: all, total: all.length });
  } catch (err: any) {
    // if medicines table missing, attempt to create then return empty list
    const msg = String(err?.message || "");
    if (msg.includes("no such table") || msg.includes("Failed query")) {
      await executeSql(`CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        generic_name TEXT,
        description TEXT NOT NULL,
        requires_prescription INTEGER DEFAULT 0,
        category TEXT,
        dosage TEXT,
        side_effects TEXT,
        warnings TEXT,
        created_at INTEGER DEFAULT (strftime('%s','now')),
        updated_at INTEGER DEFAULT (strftime('%s','now'))
      );`);
      return NextResponse.json({ medicines: [], total: 0 });
    }
    console.error('Hono GET /medicines error:', err);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

// POST /api/hono/medicines – create a medicine (name & description required)
export async function POST(req: Request) {
  // declare here so catch block can reference
  let newMed: typeof medicines.$inferInsert | undefined;
  try {
    const body = await req.json();
    const { name, description } = body ?? {};
    if (!name || !description) {
      return NextResponse.json({ error: 'name and description are required' }, { status: 400 });
    }

    // Normalize optional array / json columns
    const normalizeJson = (val: any) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) return null;
      // if already JSON string
      if (typeof val === 'string') {
        try { JSON.parse(val); return val; } catch {}
        // treat as comma-sep list
        return JSON.stringify(val.split(',').map((s:string)=>s.trim()).filter(Boolean));
      }
      // array or object
      return JSON.stringify(val);
    };

    newMed = {
      id: uuidv4(),
      name,
      description,
      genericName: body.genericName ?? null,
      requiresPrescription: body.requiresPrescription ?? false,
      category: normalizeJson(body.category),
      dosage: body.dosage ?? null,
      sideEffects: normalizeJson(body.sideEffects),
      warnings: normalizeJson(body.warnings),
    } as typeof medicines.$inferInsert;

    if (newMed) await db.insert(medicines).values(newMed);
    return NextResponse.json(newMed, { status: 201 });
  } catch (err: any) {
    const msg = String(err?.message || "");
    if (msg.includes("no such table") || msg.includes("Failed query")) {
      // attempt to create table then retry insert once
      await executeSql(`CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        generic_name TEXT,
        description TEXT NOT NULL,
        requires_prescription INTEGER DEFAULT 0,
        category TEXT,
        dosage TEXT,
        side_effects TEXT,
        warnings TEXT,
        created_at INTEGER DEFAULT (strftime('%s','now')),
        updated_at INTEGER DEFAULT (strftime('%s','now'))
      );`);
      if (newMed) await db.insert(medicines).values(newMed);
      return NextResponse.json(newMed, { status: 201 });
    }
    console.error('Hono POST /medicines error:', err);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}

export const runtime = 'nodejs'; 