import { 
  getUserById as getTursoUserById,
  getUserByEmail as getTursoUserByEmail,
  updateUser as updateTursoUser,
  updateMedicalProfile as updateTursoMedicalProfile,
  updateUserPreferences as updateTursoUserPreferences,
  isUserAdmin as isTursoUserAdmin,
  getAdminUsers as getTursoAdminUsers,
  setUserRole as setTursoUserRole,
  createUser as createTursoUser
} from './turso-user-service';
import { User, MedicalProfile, UserPreferences } from '../models/user';

export const getUserById = (uid: string) => getTursoUserById(uid);
export const getUserByEmail = (email: string) => getTursoUserByEmail(email);
export const updateUser = (uid: string, data: Partial<User>) => updateTursoUser(uid, data);
export const updateMedicalProfile = (uid: string, profile: MedicalProfile) => updateTursoMedicalProfile(uid, profile);
export const updateUserPreferences = (uid: string, preferences: UserPreferences) => updateTursoUserPreferences(uid, preferences);
export const isUserAdmin = (uid: string) => isTursoUserAdmin(uid);
export const getAdminUsers = () => getTursoAdminUsers();
export const setUserRole = (uid: string, role: 'admin' | 'user' | 'guest') => setTursoUserRole(uid, role);
export const createUser = (userData: User) => createTursoUser(userData); 