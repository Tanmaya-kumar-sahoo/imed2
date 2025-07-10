import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Define the medicines table
export const medicines = sqliteTable("medicines", {
  id: text("id").primaryKey(), // Using UUID or custom ID
  name: text("name").notNull(),
  genericName: text("generic_name"),
  description: text("description").notNull(),
  requiresPrescription: integer("requires_prescription", { mode: "boolean" }).notNull().default(false),
  category: text("category", { mode: "json" }), // Store as JSON array
  dosage: text("dosage"),
  sideEffects: text("side_effects", { mode: "json" }), // Store as JSON array
  warnings: text("warnings", { mode: "json" }), // Store as JSON array
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Define the conditions table
export const conditions = sqliteTable("conditions", {
  id: text("id").primaryKey(), // Using UUID or custom ID
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  symptoms: text("symptoms", { mode: "json" }).notNull(), // Store as JSON array
  severity: text("severity").notNull().$type<"mild" | "moderate" | "severe">(),
  requiresDoctorVisit: integer("requires_doctor_visit", { mode: "boolean" }).notNull().default(false),
  isEmergency: integer("is_emergency", { mode: "boolean" }).notNull().default(false),
  advice: text("advice"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Define the medicine_conditions join table (many-to-many relationship)
export const medicineConditions = sqliteTable("medicine_conditions", {
  medicineId: text("medicine_id").notNull().references(() => medicines.id, { onDelete: "cascade" }),
  conditionId: text("condition_id").notNull().references(() => conditions.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.medicineId, table.conditionId] }),
}));

// Define the user_recommendations table (for storing user medicine recommendations history)
export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  conditionId: text("condition_id").notNull().references(() => conditions.id),
  symptoms: text("symptoms").notNull(),
  age: text("age"),
  gender: text("gender"),
  severity: text("severity"),
  additionalAdvice: text("additional_advice"),
  isEmergency: integer("is_emergency", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  medicinesJson: text("medicines_json", { mode: "json" }),
});

// Define a join table for recommendations and medicines
export const recommendationMedicines = sqliteTable("recommendation_medicines", {
  recommendationId: text("recommendation_id").notNull().references(() => recommendations.id, { onDelete: "cascade" }),
  medicineId: text("medicine_id").notNull().references(() => medicines.id),
  dose: text("dose"),
  quantity: text("quantity"),
  description: text("description"),
}, (table) => ({
  pk: primaryKey({ columns: [table.recommendationId, table.medicineId] }),
})); 