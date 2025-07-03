'use server';

import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { userHealthProfiles } from '../db/schema/patients';

export interface UserHealthProfileInput {
  user_id: string;
  height?: string;
  weight?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  medications?: string;
}

export interface UserHealthProfile {
  id: string;
  user_id: string;
  height?: string | null;
  weight?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  medications?: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Create or update a user health profile
 */
export async function createOrUpdateHealthProfile(input: UserHealthProfileInput): Promise<UserHealthProfile> {
  // First, check if a profile already exists for this user
  const existingProfile = await db
    .select()
    .from(userHealthProfiles)
    .where(eq(userHealthProfiles.user_id, input.user_id))
    .limit(1);

  if (existingProfile.length > 0) {
    // Update existing profile
    const [updatedProfile] = await db
      .update(userHealthProfiles)
      .set({
        height: input.height,
        weight: input.weight,
        blood_type: input.blood_type,
        allergies: input.allergies,
        chronic_conditions: input.chronic_conditions,
        medications: input.medications,
        updated_at: Math.floor(Date.now() / 1000), // Unix timestamp
      })
      .where(eq(userHealthProfiles.user_id, input.user_id))
      .returning();
    
    return updatedProfile;
  } else {
    // Create new profile
    const id = nanoid();
    const currentTime = Math.floor(Date.now() / 1000);
    
    const [newProfile] = await db
      .insert(userHealthProfiles)
      .values({
        id,
        user_id: input.user_id,
        height: input.height,
        weight: input.weight,
        blood_type: input.blood_type,
        allergies: input.allergies,
        chronic_conditions: input.chronic_conditions,
        medications: input.medications,
        created_at: currentTime,
        updated_at: currentTime,
      })
      .returning();

    return newProfile;
  }
}

/**
 * Get user health profile by user ID
 */
export async function getHealthProfile(userId: string): Promise<UserHealthProfile | null> {
  const profiles = await db
    .select()
    .from(userHealthProfiles)
    .where(eq(userHealthProfiles.user_id, userId))
    .limit(1);
  
  return profiles.length > 0 ? profiles[0] : null;
}

/**
 * Delete a user health profile
 */
export async function deleteHealthProfile(userId: string): Promise<void> {
  await db
    .delete(userHealthProfiles)
    .where(eq(userHealthProfiles.user_id, userId));
}

// Legacy functions for backward compatibility
export interface PatientPresetInput {
  userId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

/**
 * Create a patient preset for the current user
 * @deprecated Use createOrUpdateHealthProfile instead
 */
export async function createPreset(input: PatientPresetInput) {
  // Convert legacy preset to health profile format
  const healthProfileInput: UserHealthProfileInput = {
    user_id: input.userId,
    // We can't directly map name, age, gender to the new structure
    // Store as chronic_conditions or medications temporarily
    chronic_conditions: `Age: ${input.age}, Gender: ${input.gender}, Name: ${input.name}`,
  };
  
  return createOrUpdateHealthProfile(healthProfileInput);
}

/**
 * Fetch all patient presets for a user
 * @deprecated Use getHealthProfile instead
 */
export async function getPresets(userId: string) {
  const profile = await getHealthProfile(userId);
  return profile ? [profile] : [];
}

/**
 * Delete a preset by id ensuring it belongs to the user
 * @deprecated Use deleteHealthProfile instead
 */
export async function deletePreset(id: string, userId: string) {
  return deleteHealthProfile(userId);
} 