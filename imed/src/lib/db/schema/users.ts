import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Define the users table (synced with Firebase auth)
export const users = sqliteTable("users", {
  // Use Firebase auth UID as primary key
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("user").$type<"user" | "admin">(),
  password: text("password"),
  
  // Additional user metadata
  preferredLanguage: text("preferred_language").default("en"),
  ageGroup: text("age_group").$type<"child" | "adult" | "old">(),
  
  // Timestamps
  lastLogin: integer("last_login", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// AI customization settings per user
export const userAiSettings = sqliteTable("user_ai_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  model: text("model").default("gpt-3.5-turbo"),
  temperature: text("temperature").default("0.7"),
  topP: text("top_p").default("0.95"),
  maxTokens: integer("max_tokens").default(500),
  promptTemplate: text("prompt_template"),
  apiKey: text("api_key"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// User health profile for more personalized recommendations
export const userHealthProfiles = sqliteTable("user_health_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  height: text("height"),
  weight: text("weight"),
  bloodType: text("blood_type"),
  allergies: text("allergies", { mode: "json" }),
  chronicConditions: text("chronic_conditions", { mode: "json" }),
  medications: text("medications", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
}); 