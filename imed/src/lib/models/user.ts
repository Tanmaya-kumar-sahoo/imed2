export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  password?: string;
  role: 'admin' | 'user' | 'guest';
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  preferences?: UserPreferences;
  medicalProfile?: MedicalProfile;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailNotifications?: boolean;
  language?: string;
}

export interface MedicalProfile {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  bloodType?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
} 