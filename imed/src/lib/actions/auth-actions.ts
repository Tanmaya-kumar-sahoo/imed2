'use server';

import { hash } from 'bcrypt';
import { createUser } from '../services/user-service';

export async function registerUser(userData: {
  email: string;
  password: string;
  displayName: string;
}) {
  try {
    // Hash the password
    const hashedPassword = await hash(userData.password, 10);
    
    // Create a unique user ID
    const uid = `user_${Date.now()}`;

    // Use JavaScript Date objects for timestamps
    const now = new Date();
    
    // Create the user in Turso
    await createUser({
      uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: null,
      password: hashedPassword,
      role: 'user',
      lastLogin: now,
      createdAt: now,
      updatedAt: now
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: 'Failed to register user' };
  }
}
