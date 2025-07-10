import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

// User health profiles table - matches Turso database structure
export const userHealthProfiles = sqliteTable("user_health_profiles", {
  id: text("id").primaryKey(), // PRIMARY KEY
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // TEXT NOT NULL, FOREIGN KEY
  height: text("height"), // TEXT
  weight: text("weight"), // TEXT  
  blood_type: text("blood_type"), // TEXT
  allergies: text("allergies"), // TEXT
  chronic_conditions: text("chronic_conditions"), // TEXT
  medications: text("medications"), // TEXT
  created_at: integer("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`), // INTEGER NOT NULL DEFAULT '(CURRENT_TIMESTAMP)'
  updated_at: integer("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`), // INTEGER NOT NULL DEFAULT '(CURRENT_TIMESTAMP)'
});

// Stores reusable patient presets (belongs to a user)
export const patientPresets = sqliteTable("patient_presets", {
  id: text("id").primaryKey(), // could be nanoid()
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull().$type<"male" | "female" | "other">(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
}); 

export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }), // Unique patient number
  name: text("name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  height: text("height"),
  weight: text("weight"),
  phone: text("phone").unique(),
  address: text("address"),
  // Health profile fields:
  bloodType: text("blood_type"),
  allergies: text("allergies"), // JSON or comma-separated
  chronicConditions: text("chronic_conditions"), // JSON or comma-separated
  medications: text("medications"), // JSON or comma-separated
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
}); 