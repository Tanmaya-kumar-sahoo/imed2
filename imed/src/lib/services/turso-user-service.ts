'use server';

import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { User, MedicalProfile, UserPreferences } from '../models/user';

/** Get user by id */
export async function getUserById(uid: string): Promise<User | null> {
  const row = await db.select().from(users).where(eq(users.id, uid)).then((r: any) => r[0]);
  return (row ?? null) as unknown as User | null;
}

/** Get user by email */
export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.email, email));
  return (rows[0] ?? null) as unknown as User | null;
}

/** Update user */
export async function updateUser(uid: string, data: Partial<User>) {
  await db.update(users).set(data as any).where(eq(users.id, uid));
}

/** Update medical profile */
export async function updateMedicalProfile(uid: string, profile: MedicalProfile) {
  await db.update(users).set({ medicalProfile: profile } as any).where(eq(users.id, uid));
}

/** Update preferences */
export async function updateUserPreferences(uid: string, preferences: UserPreferences) {
  await db.update(users).set({ preferences } as any).where(eq(users.id, uid));
}

/** Check if user is admin */
export async function isUserAdmin(uid: string) {
  const user = await getUserById(uid);
  return user?.role === 'admin';
}

/** Get admins */
export async function getAdminUsers() {
  return db.select().from(users).where(eq(users.role, 'admin' as any)) as unknown as User[];
}

/** Set role */
export async function setUserRole(uid: string, role: 'admin' | 'user' | 'guest') {
  await db.update(users).set({ role } as any).where(eq(users.id, uid));
}

/** Create user */
export async function createUser(userData: User) {
  // Only insert columns defined in the users table schema, using Drizzle property names
  const { uid, email, displayName, photoURL, role, password, lastLogin, createdAt, updatedAt } = userData as any;
  try {
    await db.insert(users).values({
      id: uid,
      email: email ?? '',
      displayName,
      photoURL,
      role: role ?? 'user',
      password,
      lastLogin,
      createdAt,
      updatedAt
    });
  } catch (error) {
    console.error('Error inserting user into Turso:', error, {
      id: uid,
      email,
      displayName,
      photoURL,
      role,
      password,
      lastLogin,
      createdAt,
      updatedAt
    });
    throw error;
  }
} 