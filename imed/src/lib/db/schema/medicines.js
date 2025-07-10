"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationMedicines = exports.recommendations = exports.medicineConditions = exports.conditions = exports.medicines = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
var drizzle_orm_1 = require("drizzle-orm");
// Define the medicines table
exports.medicines = (0, sqlite_core_1.sqliteTable)("medicines", {
    id: (0, sqlite_core_1.text)("id").primaryKey(), // Using UUID or custom ID
    name: (0, sqlite_core_1.text)("name").notNull(),
    genericName: (0, sqlite_core_1.text)("generic_name"),
    description: (0, sqlite_core_1.text)("description").notNull(),
    requiresPrescription: (0, sqlite_core_1.integer)("requires_prescription", { mode: "boolean" }).notNull().default(false),
    category: (0, sqlite_core_1.text)("category", { mode: "json" }), // Store as JSON array
    dosage: (0, sqlite_core_1.text)("dosage"),
    sideEffects: (0, sqlite_core_1.text)("side_effects", { mode: "json" }), // Store as JSON array
    warnings: (0, sqlite_core_1.text)("warnings", { mode: "json" }), // Store as JSON array
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
// Define the conditions table
exports.conditions = (0, sqlite_core_1.sqliteTable)("conditions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(), // Using UUID or custom ID
    name: (0, sqlite_core_1.text)("name").notNull().unique(),
    description: (0, sqlite_core_1.text)("description").notNull(),
    symptoms: (0, sqlite_core_1.text)("symptoms", { mode: "json" }).notNull(), // Store as JSON array
    severity: (0, sqlite_core_1.text)("severity").notNull().$type(),
    requiresDoctorVisit: (0, sqlite_core_1.integer)("requires_doctor_visit", { mode: "boolean" }).notNull().default(false),
    isEmergency: (0, sqlite_core_1.integer)("is_emergency", { mode: "boolean" }).notNull().default(false),
    advice: (0, sqlite_core_1.text)("advice"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
// Define the medicine_conditions join table (many-to-many relationship)
exports.medicineConditions = (0, sqlite_core_1.sqliteTable)("medicine_conditions", {
    medicineId: (0, sqlite_core_1.text)("medicine_id").notNull().references(function () { return exports.medicines.id; }, { onDelete: "cascade" }),
    conditionId: (0, sqlite_core_1.text)("condition_id").notNull().references(function () { return exports.conditions.id; }, { onDelete: "cascade" }),
}, function (table) { return ({
    pk: (0, sqlite_core_1.primaryKey)({ columns: [table.medicineId, table.conditionId] }),
}); });
// Define the user_recommendations table (for storing user medicine recommendations history)
exports.recommendations = (0, sqlite_core_1.sqliteTable)("recommendations", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userId: (0, sqlite_core_1.text)("user_id"),
    conditionId: (0, sqlite_core_1.text)("condition_id").notNull().references(function () { return exports.conditions.id; }),
    symptoms: (0, sqlite_core_1.text)("symptoms").notNull(),
    age: (0, sqlite_core_1.text)("age"),
    gender: (0, sqlite_core_1.text)("gender"),
    severity: (0, sqlite_core_1.text)("severity"),
    additionalAdvice: (0, sqlite_core_1.text)("additional_advice"),
    isEmergency: (0, sqlite_core_1.integer)("is_emergency", { mode: "boolean" }).notNull().default(false),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
});
// Define a join table for recommendations and medicines
exports.recommendationMedicines = (0, sqlite_core_1.sqliteTable)("recommendation_medicines", {
    recommendationId: (0, sqlite_core_1.text)("recommendation_id").notNull().references(function () { return exports.recommendations.id; }, { onDelete: "cascade" }),
    medicineId: (0, sqlite_core_1.text)("medicine_id").notNull().references(function () { return exports.medicines.id; }),
}, function (table) { return ({
    pk: (0, sqlite_core_1.primaryKey)({ columns: [table.recommendationId, table.medicineId] }),
}); });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
