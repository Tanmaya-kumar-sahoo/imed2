'use client';

import {
  createMedicine as tursoCreateMedicine,
  getMedicineById as tursoGetMedicineById,
  updateMedicine as tursoUpdateMedicine,
  deleteMedicine as tursoDeleteMedicine,
  getAllMedicines as tursoGetAllMedicines,
  createCondition as tursoCreateCondition,
  getConditionById as tursoGetConditionById,
  updateCondition as tursoUpdateCondition,
  deleteCondition as tursoDeleteCondition,
  getAllConditions as tursoGetAllConditions,
  saveRecommendation as tursoSaveRecommendation,
  getUserRecommendations as tursoGetUserRecommendations
} from './turso-medicine-service';
import { Medicine, Condition } from '../models/medicine';

export const createMedicine = (medicine: Medicine) => tursoCreateMedicine(medicine);
export const getMedicineById = (id: string) => tursoGetMedicineById(id);
export const updateMedicine = (id: string, data: Partial<Medicine>) => tursoUpdateMedicine(id, data);
export const deleteMedicine = (id: string) => tursoDeleteMedicine(id);
export const getAllMedicines = () => tursoGetAllMedicines();

export const getMedicinesByCondition = async (condition: string) => {
  const meds = await tursoGetAllMedicines();
  return meds.filter(m => (m as any).conditions?.includes(condition));
};

// Using tursoMedicineService functions for conditions
export const createCondition = (condition: Condition) => tursoCreateCondition(condition as any);
export const getConditionById = (id: string) => tursoGetConditionById(id);
export const updateCondition = (id: string, data: Partial<Condition>) => tursoUpdateCondition(id, data as any);
export const deleteCondition = (id: string) => tursoDeleteCondition(id);
export const getAllConditions = () => tursoGetAllConditions();

export const saveRecommendation = (userId: string, data: any) => tursoSaveRecommendation({ userId, ...data });
export const getUserRecommendations = (userId: string) => tursoGetUserRecommendations(userId);

export const findConditionsBySymptoms = async (symptoms: string[]) => {
  const conditions = await getAllConditions();
  return conditions
    .map((condition: any) => {
      const matching = condition.symptoms.filter((symptom: string) => 
        symptoms.some((s: string) => symptom.toLowerCase().includes(s.toLowerCase()))
      );
      const score = matching.length / condition.symptoms.length;
      return { condition, score, matchingSymptoms: matching };
    })
    .filter((c: {score: number}) => c.score > 0.3)
    .sort((a: {score: number}, b: {score: number}) => b.score - a.score);
}; 