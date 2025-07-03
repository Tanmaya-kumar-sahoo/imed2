export interface Medicine {
  id?: string;
  name: string;
  genericName?: string;
  brandNames?: string[];
  description: string;
  usageInstructions?: string;
  sideEffects?: string[];
  warnings?: string[];
  requiresPrescription: boolean;
  dosage?: string;
  category?: string[];
  conditions?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Condition {
  id?: string;
  name: string;
  description: string;
  symptoms: string[];
  recommendedMedicines: string[]; // Medicine IDs
  severity: 'mild' | 'moderate' | 'severe';
  requiresDoctorVisit: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface MedicineRecommendation {
  condition: string;
  medicines: Medicine[];
  doctorVisitRecommended: boolean;
  additionalAdvice?: string;
  createdAt?: any;
} 