'use client';

import { 
  PatientPresetInput,
  createPreset as createTursoPreset,
  getPresets as getTursoPresets,
  deletePreset as deleteTursoPreset 
} from './turso-patient-service';

export const PatientService = {
  createPreset: (input: PatientPresetInput) => createTursoPreset(input),
  getPresets: (userId: string) => getTursoPresets(userId),
  deletePreset: (id: string, userId: string) => deleteTursoPreset(id, userId),
}; 