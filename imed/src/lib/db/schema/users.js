"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHealthProfiles = exports.userAiSettings = exports.users = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
var drizzle_orm_1 = require("drizzle-orm");
// Define the users table (synced with Firebase auth)
exports.users = (0, sqlite_core_1.sqliteTable)("users", {
    // Use Firebase auth UID as primary key
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    email: (0, sqlite_core_1.text)("email").notNull().unique(),
    displayName: (0, sqlite_core_1.text)("display_name"),
    photoURL: (0, sqlite_core_1.text)("photo_url"),
    role: (0, sqlite_core_1.text)("role").notNull().default("user").$type(),
    password: (0, sqlite_core_1.text)("password"),
    // Additional user metadata
    preferredLanguage: (0, sqlite_core_1.text)("preferred_language").default("en"),
    ageGroup: (0, sqlite_core_1.text)("age_group").$type(),
    // Timestamps
    lastLogin: (0, sqlite_core_1.integer)("last_login", { mode: "timestamp" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
// AI customization settings per user
exports.userAiSettings = (0, sqlite_core_1.sqliteTable)("user_ai_settings", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userId: (0, sqlite_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    model: (0, sqlite_core_1.text)("model").default("gpt-3.5-turbo"),
    temperature: (0, sqlite_core_1.text)("temperature").default("0.7"),
    topP: (0, sqlite_core_1.text)("top_p").default("0.95"),
    maxTokens: (0, sqlite_core_1.integer)("max_tokens").default(500),
    promptTemplate: (0, sqlite_core_1.text)("prompt_template"),
    apiKey: (0, sqlite_core_1.text)("api_key"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
// User health profile for more personalized recommendations
exports.userHealthProfiles = (0, sqlite_core_1.sqliteTable)("user_health_profiles", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userId: (0, sqlite_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    height: (0, sqlite_core_1.text)("height"),
    weight: (0, sqlite_core_1.text)("weight"),
    bloodType: (0, sqlite_core_1.text)("blood_type"),
    allergies: (0, sqlite_core_1.text)("allergies", { mode: "json" }),
    chronicConditions: (0, sqlite_core_1.text)("chronic_conditions", { mode: "json" }),
    medications: (0, sqlite_core_1.text)("medications", { mode: "json" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
