"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientPresets = exports.userHealthProfiles = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
var drizzle_orm_1 = require("drizzle-orm");
var users_1 = require("./users");
// User health profiles table - matches Turso database structure
exports.userHealthProfiles = (0, sqlite_core_1.sqliteTable)("user_health_profiles", {
    id: (0, sqlite_core_1.text)("id").primaryKey(), // PRIMARY KEY
    user_id: (0, sqlite_core_1.text)("user_id").notNull().references(function () { return users_1.users.id; }, { onDelete: "cascade" }), // TEXT NOT NULL, FOREIGN KEY
    height: (0, sqlite_core_1.text)("height"), // TEXT
    weight: (0, sqlite_core_1.text)("weight"), // TEXT  
    blood_type: (0, sqlite_core_1.text)("blood_type"), // TEXT
    allergies: (0, sqlite_core_1.text)("allergies"), // TEXT
    chronic_conditions: (0, sqlite_core_1.text)("chronic_conditions"), // TEXT
    medications: (0, sqlite_core_1.text)("medications"), // TEXT
    created_at: (0, sqlite_core_1.integer)("created_at").notNull().default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["(CURRENT_TIMESTAMP)"], ["(CURRENT_TIMESTAMP)"])))), // INTEGER NOT NULL DEFAULT '(CURRENT_TIMESTAMP)'
    updated_at: (0, sqlite_core_1.integer)("updated_at").notNull().default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["(CURRENT_TIMESTAMP)"], ["(CURRENT_TIMESTAMP)"])))), // INTEGER NOT NULL DEFAULT '(CURRENT_TIMESTAMP)'
});
// Stores reusable patient presets (belongs to a user)
exports.patientPresets = (0, sqlite_core_1.sqliteTable)("patient_presets", {
    id: (0, sqlite_core_1.text)("id").primaryKey(), // could be nanoid()
    userId: (0, sqlite_core_1.text)("user_id").notNull().references(function () { return users_1.users.id; }, { onDelete: "cascade" }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    age: (0, sqlite_core_1.integer)("age").notNull(),
    gender: (0, sqlite_core_1.text)("gender").notNull().$type(),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
