'use server';

import { db } from '../db';
import { eq, and, like, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { 
  medicines,
  conditions,
  medicineConditions,
  recommendations,
  recommendationMedicines,
  recommendedMedicinesHistory
} from '../db/schema';

/**
 * Turso Medicine Service
 * This service handles all interactions with the Turso SQL database for medicines and conditions
 */

/**
 * Get all medicines
 */
export async function getAllMedicines() {
  return await db.select().from(medicines);
}

/**
 * Create a new medicine
 */
export async function createMedicine(data: any) {
  const id = uuidv4();
  return await db.insert(medicines).values({
    id,
    name: data.name,
    genericName: data.genericName,
    description: data.description,
    requiresPrescription: data.requiresPrescription,
    category: JSON.stringify(data.category),
    dosage: data.dosage,
    sideEffects: data.sideEffects ? JSON.stringify(data.sideEffects) : null,
    warnings: data.warnings ? JSON.stringify(data.warnings) : null
  }).returning().then(rows => rows[0]);
}

/**
 * Get a medicine by ID
 */
export async function getMedicineById(id: string) {
  return await db.select().from(medicines).where(eq(medicines.id, id)).then(rows => rows[0] || null);
}

/**
 * Get medicines by name (partial match)
 */
export async function getMedicinesByName(name: string) {
  return await db.select().from(medicines)
    .where(like(medicines.name, `%${name}%`));
}

/**
 * Update a medicine
 */
export async function updateMedicine(id: string, data: any) {
  return await db.update(medicines)
    .set({
      name: data.name,
      genericName: data.genericName,
      description: data.description,
      requiresPrescription: data.requiresPrescription,
      category: data.category ? JSON.stringify(data.category) : undefined,
      dosage: data.dosage,
      sideEffects: data.sideEffects ? JSON.stringify(data.sideEffects) : undefined,
      warnings: data.warnings ? JSON.stringify(data.warnings) : undefined,
    })
    .where(eq(medicines.id, id))
    .returning()
    .then(rows => rows[0]);
}

/**
 * Delete a medicine
 */
export async function deleteMedicine(id: string) {
  return await db.delete(medicines).where(eq(medicines.id, id));
}

/**
 * Create a new condition
 */
export async function createCondition(data: any) {
  const id = uuidv4();
  return await db.insert(conditions).values({
    id,
    name: data.name,
    description: data.description,
    symptoms: JSON.stringify(data.symptoms),
    severity: data.severity,
    requiresDoctorVisit: data.requiresDoctorVisit,
    isEmergency: data.isEmergency,
    advice: data.advice
  }).returning().then(rows => rows[0]);
}

/**
 * Get a condition by ID
 */
export async function getConditionById(id: string) {
  return await db.select().from(conditions).where(eq(conditions.id, id)).then(rows => rows[0] || null);
}

/**
 * Get condition by name (exact match)
 */
export async function getConditionByName(name: string) {
  return await db.select().from(conditions)
    .where(eq(conditions.name, name))
    .then(rows => rows[0] || null);
}

/**
 * Match symptoms to conditions
 */
export async function matchSymptomsToConditions(symptoms: string[]) {
  // This is a simplified approach - we're assuming symptoms are stored as JSON arrays in Turso
  // We use a basic pattern matching strategy here
  const allConditions = await db.select().from(conditions);
  
  return allConditions.map(condition => {
    const conditionSymptoms = JSON.parse(condition.symptoms as string) as string[];
    // Count how many symptoms match
    const matchCount = symptoms.filter(symptom => 
      conditionSymptoms.some((s: string) => 
        s.toLowerCase().includes(symptom.toLowerCase())
      )
    ).length;
    
    return {
      condition,
      matchScore: matchCount / symptoms.length
    };
  })
  .filter(result => result.matchScore > 0)
  .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Associate medicines with a condition
 */
export async function associateMedicinesWithCondition(conditionId: string, medicineIds: string[]) {
  const values = medicineIds.map(medicineId => ({
    medicineId,
    conditionId
  }));
  
  return await db.insert(medicineConditions).values(values);
}

/**
 * Get medicines for a condition
 */
export async function getMedicinesForCondition(conditionId: string) {
  return await db.select({
    medicine: medicines
  })
  .from(medicineConditions)
  .innerJoin(medicines, eq(medicineConditions.medicineId, medicines.id))
  .where(eq(medicineConditions.conditionId, conditionId))
  .then(rows => rows.map(row => row.medicine));
}

/**
 * Save a recommendation
 */
export async function saveRecommendation(data: any) {
  try {
    console.log('Saving recommendation:', data);
    if (!data.patientId) {
      throw new Error('Missing patientId (integer) for recommended_medicines_history');
    }
    const result = await db.insert(recommendedMedicinesHistory).values({
      patientId: data.patientId, // must be integer
      doctorId: data.doctorId, // should be userId of the doctor
      recommendedMedicines: data.recommendedMedicines,
      symptoms: data.symptoms,
      severity: data.severity,
      verified: true,
      createdAt: Math.floor(Date.now() / 1000),
    }).returning().then(rows => rows[0]);
    console.log('Saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving recommendation:', error);
    throw error;
  }
}

/**
 * Get recommendations for a user
 */
export async function getUserRecommendations(userId: string) {
  return await db.select({
    id: recommendations.id,
    userId: recommendations.userId,
    conditionId: recommendations.conditionId,
    symptoms: recommendations.symptoms,
    age: recommendations.age,
    gender: recommendations.gender,
    severity: recommendations.severity,
    additionalAdvice: recommendations.additionalAdvice,
    isEmergency: recommendations.isEmergency,
    createdAt: recommendations.createdAt,
  }).from(recommendations)
    .where(eq(recommendations.userId, userId))
    .orderBy(recommendations.createdAt);
}

/**
 * Get recommended medicines for a recommendation
 */
export async function getMedicinesForRecommendation(recommendationId: string) {
  return await db.select({
    medicine: medicines
  })
  .from(recommendationMedicines)
  .innerJoin(medicines, eq(recommendationMedicines.medicineId, medicines.id))
  .where(eq(recommendationMedicines.recommendationId, recommendationId))
  .then(rows => rows.map(row => row.medicine));
}

/**
 * Get all conditions
 */
export async function getAllConditions() {
  return await db.select().from(conditions).orderBy(conditions.name);
}

/**
 * Update a condition
 */
export async function updateCondition(id: string, data: any) {
  return await db.update(conditions)
    .set({
      name: data.name,
      description: data.description,
      symptoms: data.symptoms ? JSON.stringify(data.symptoms) : undefined,
      severity: data.severity,
      requiresDoctorVisit: data.requiresDoctorVisit,
      isEmergency: data.isEmergency,
      advice: data.advice
    })
    .where(eq(conditions.id, id))
    .returning()
    .then(rows => rows[0]);
}

/**
 * Delete a condition
 */
export async function deleteCondition(id: string) {
  return await db.delete(conditions).where(eq(conditions.id, id));
} 