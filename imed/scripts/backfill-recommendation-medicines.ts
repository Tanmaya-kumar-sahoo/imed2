import { db } from "../src/lib/db";
import { recommendations, recommendationMedicines } from "../src/lib/db/schema/medicines";
import { getMedicinesForCondition } from "../src/lib/services/turso-medicine-service";
import { eq } from "drizzle-orm";

async function backfillRecommendationMedicines() {
  // Get all recommendations
  const allRecs = await db.select().from(recommendations);

  for (const rec of allRecs) {
    // Check if this recommendation already has medicines
    const existing = await db.select().from(recommendationMedicines).where(eq(recommendationMedicines.recommendationId, rec.id));
    if (existing.length > 0) continue; // Already has medicines

    // Try to find medicines for the condition
    let medicineList: any[] = [];
    if (rec.conditionId) {
      medicineList = await getMedicinesForCondition(rec.conditionId);
    }

    // If no medicines found, skip
    if (!medicineList || medicineList.length === 0) {
      console.log(`No medicines found for recommendation ${rec.id}`);
      continue;
    }

    // Insert associations
    await db.insert(recommendationMedicines).values(
      medicineList.map((med: any) => ({
        recommendationId: rec.id,
        medicineId: med.id,
      }))
    );
    console.log(`Backfilled medicines for recommendation ${rec.id}`);
  }
}

backfillRecommendationMedicines()
  .then(() => {
    console.log("Backfill complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error during backfill:", err);
    process.exit(1);
  }); 