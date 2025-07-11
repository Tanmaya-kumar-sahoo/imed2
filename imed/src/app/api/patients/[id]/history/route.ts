import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

// Adjust the import path and table name as needed
import { recommendedMedicinesHistory } from '@/lib/db/schema';
import { users } from '@/lib/db/schema';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const id = Number(context.params.id);
    console.log('Fetching history for patient:', id);
    const history = await db
      .select({
        id: recommendedMedicinesHistory.id,
        patientId: recommendedMedicinesHistory.patientId,
        doctorId: recommendedMedicinesHistory.doctorId,
        recommendedMedicines: recommendedMedicinesHistory.recommendedMedicines,
        symptoms: recommendedMedicinesHistory.symptoms,
        severity: recommendedMedicinesHistory.severity,
        verified: recommendedMedicinesHistory.verified,
        createdAt: recommendedMedicinesHistory.createdAt,
        doctorName: users.displayName
      })
      .from(recommendedMedicinesHistory)
      .leftJoin(users, eq(recommendedMedicinesHistory.doctorId, users.id))
      .where(eq(recommendedMedicinesHistory.patientId, id))
      .orderBy(desc(recommendedMedicinesHistory.createdAt));
    console.log('Fetched history:', history);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    return NextResponse.json({ error: 'Failed to fetch patient history', details: String(error) }, { status: 500 });
  }
} 