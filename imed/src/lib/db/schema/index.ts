// Export all schema tables from their respective files
export * from './medicines';
export * from './users';

// Export schema for Drizzle migration tools
import * as medicineSchema from './medicines';
import * as userSchema from './users';
import * as patientSchema from './patients';

// Make sure all tables are properly exported
export const schema = {
  ...medicineSchema,
  ...userSchema,
  ...patientSchema,
}; 