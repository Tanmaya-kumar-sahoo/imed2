'use server';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMedicines = getAllMedicines;
exports.createMedicine = createMedicine;
exports.getMedicineById = getMedicineById;
exports.getMedicinesByName = getMedicinesByName;
exports.updateMedicine = updateMedicine;
exports.deleteMedicine = deleteMedicine;
exports.createCondition = createCondition;
exports.getConditionById = getConditionById;
exports.getConditionByName = getConditionByName;
exports.matchSymptomsToConditions = matchSymptomsToConditions;
exports.associateMedicinesWithCondition = associateMedicinesWithCondition;
exports.getMedicinesForCondition = getMedicinesForCondition;
exports.saveRecommendation = saveRecommendation;
exports.getUserRecommendations = getUserRecommendations;
exports.getMedicinesForRecommendation = getMedicinesForRecommendation;
exports.getAllConditions = getAllConditions;
exports.updateCondition = updateCondition;
exports.deleteCondition = deleteCondition;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var schema_1 = require("../db/schema");
/**
 * Turso Medicine Service
 * This service handles all interactions with the Turso SQL database for medicines and conditions
 */
/**
 * Get all medicines
 */
function getAllMedicines() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.medicines)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Create a new medicine
 */
function createMedicine(data) {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = (0, uuid_1.v4)();
                    return [4 /*yield*/, db_1.db.insert(schema_1.medicines).values({
                            id: id,
                            name: data.name,
                            genericName: data.genericName,
                            description: data.description,
                            requiresPrescription: data.requiresPrescription,
                            category: JSON.stringify(data.category),
                            dosage: data.dosage,
                            sideEffects: data.sideEffects ? JSON.stringify(data.sideEffects) : null,
                            warnings: data.warnings ? JSON.stringify(data.warnings) : null
                        }).returning().then(function (rows) { return rows[0]; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get a medicine by ID
 */
function getMedicineById(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.medicines).where((0, drizzle_orm_1.eq)(schema_1.medicines.id, id)).then(function (rows) { return rows[0] || null; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get medicines by name (partial match)
 */
function getMedicinesByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.medicines)
                        .where((0, drizzle_orm_1.like)(schema_1.medicines.name, "%".concat(name, "%")))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Update a medicine
 */
function updateMedicine(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.update(schema_1.medicines)
                        .set({
                        name: data.name,
                        genericName: data.genericName,
                        description: data.description,
                        requiresPrescription: data.requiresPrescription,
                        category: data.category ? JSON.stringify(data.category) : undefined,
                        dosage: data.dosage,
                        sideEffects: data.sideEffects ? JSON.stringify(data.sideEffects) : undefined,
                        warnings: data.warnings ? JSON.stringify(data.warnings) : undefined,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.medicines.id, id))
                        .returning()
                        .then(function (rows) { return rows[0]; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Delete a medicine
 */
function deleteMedicine(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.delete(schema_1.medicines).where((0, drizzle_orm_1.eq)(schema_1.medicines.id, id))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Create a new condition
 */
function createCondition(data) {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = (0, uuid_1.v4)();
                    return [4 /*yield*/, db_1.db.insert(schema_1.conditions).values({
                            id: id,
                            name: data.name,
                            description: data.description,
                            symptoms: JSON.stringify(data.symptoms),
                            severity: data.severity,
                            requiresDoctorVisit: data.requiresDoctorVisit,
                            isEmergency: data.isEmergency,
                            advice: data.advice
                        }).returning().then(function (rows) { return rows[0]; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get a condition by ID
 */
function getConditionById(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.conditions).where((0, drizzle_orm_1.eq)(schema_1.conditions.id, id)).then(function (rows) { return rows[0] || null; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get condition by name (exact match)
 */
function getConditionByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.conditions)
                        .where((0, drizzle_orm_1.eq)(schema_1.conditions.name, name))
                        .then(function (rows) { return rows[0] || null; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Match symptoms to conditions
 */
function matchSymptomsToConditions(symptoms) {
    return __awaiter(this, void 0, void 0, function () {
        var allConditions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.conditions)];
                case 1:
                    allConditions = _a.sent();
                    return [2 /*return*/, allConditions.map(function (condition) {
                            var conditionSymptoms = JSON.parse(condition.symptoms);
                            // Count how many symptoms match
                            var matchCount = symptoms.filter(function (symptom) {
                                return conditionSymptoms.some(function (s) {
                                    return s.toLowerCase().includes(symptom.toLowerCase());
                                });
                            }).length;
                            return {
                                condition: condition,
                                matchScore: matchCount / symptoms.length
                            };
                        })
                            .filter(function (result) { return result.matchScore > 0; })
                            .sort(function (a, b) { return b.matchScore - a.matchScore; })];
            }
        });
    });
}
/**
 * Associate medicines with a condition
 */
function associateMedicinesWithCondition(conditionId, medicineIds) {
    return __awaiter(this, void 0, void 0, function () {
        var values;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    values = medicineIds.map(function (medicineId) { return ({
                        medicineId: medicineId,
                        conditionId: conditionId
                    }); });
                    return [4 /*yield*/, db_1.db.insert(schema_1.medicineConditions).values(values)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get medicines for a condition
 */
function getMedicinesForCondition(conditionId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select({
                        medicine: schema_1.medicines
                    })
                        .from(schema_1.medicineConditions)
                        .innerJoin(schema_1.medicines, (0, drizzle_orm_1.eq)(schema_1.medicineConditions.medicineId, schema_1.medicines.id))
                        .where((0, drizzle_orm_1.eq)(schema_1.medicineConditions.conditionId, conditionId))
                        .then(function (rows) { return rows.map(function (row) { return row.medicine; }); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Save a recommendation
 */
function saveRecommendation(data) {
    return __awaiter(this, void 0, void 0, function () {
        var id, recommendation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = (0, uuid_1.v4)();
                    return [4 /*yield*/, db_1.db.insert(schema_1.recommendations).values({
                            id: id,
                            userId: data.userId,
                            conditionId: data.conditionId,
                            symptoms: data.symptoms,
                            age: data.age,
                            gender: data.gender,
                            severity: data.severity,
                            additionalAdvice: data.additionalAdvice,
                            isEmergency: data.isEmergency
                        }).returning().then(function (rows) { return rows[0]; })];
                case 1:
                    recommendation = _a.sent();
                    if (!(data.medicineIds && data.medicineIds.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.db.insert(schema_1.recommendationMedicines).values(data.medicineIds.map(function (medicineId) { return ({
                            recommendationId: id,
                            medicineId: medicineId
                        }); }))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, recommendation];
            }
        });
    });
}
/**
 * Get recommendations for a user
 */
function getUserRecommendations(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var recs, withMedicines;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select({
                        id: schema_1.recommendations.id,
                        userId: schema_1.recommendations.userId,
                        conditionId: schema_1.recommendations.conditionId,
                        symptoms: schema_1.recommendations.symptoms,
                        age: schema_1.recommendations.age,
                        gender: schema_1.recommendations.gender,
                        severity: schema_1.recommendations.severity,
                        additionalAdvice: schema_1.recommendations.additionalAdvice,
                        isEmergency: schema_1.recommendations.isEmergency,
                        createdAt: schema_1.recommendations.createdAt,
                    }).from(schema_1.recommendations)
                        .where((0, drizzle_orm_1.eq)(schema_1.recommendations.userId, userId))
                        .orderBy(schema_1.recommendations.createdAt)];
                case 1:
                    recs = _a.sent();
                    return [4 /*yield*/, Promise.all(recs.map(function (rec) { return __awaiter(_this, void 0, void 0, function () {
                            var medicines;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getMedicinesForRecommendation(rec.id)];
                                    case 1:
                                        medicines = _a.sent();
                                        return [2 /*return*/, __assign(__assign({}, rec), { medicines: medicines })];
                                }
                            });
                        }); }))];
                case 2:
                    withMedicines = _a.sent();
                    return [2 /*return*/, withMedicines];
            }
        });
    });
}
/**
 * Get recommended medicines for a recommendation
 */
function getMedicinesForRecommendation(recommendationId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select({
                        medicine: schema_1.medicines
                    })
                        .from(schema_1.recommendationMedicines)
                        .innerJoin(schema_1.medicines, (0, drizzle_orm_1.eq)(schema_1.recommendationMedicines.medicineId, schema_1.medicines.id))
                        .where((0, drizzle_orm_1.eq)(schema_1.recommendationMedicines.recommendationId, recommendationId))
                        .then(function (rows) { return rows.map(function (row) { return row.medicine; }); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get all conditions
 */
function getAllConditions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.conditions).orderBy(schema_1.conditions.name)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Update a condition
 */
function updateCondition(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.update(schema_1.conditions)
                        .set({
                        name: data.name,
                        description: data.description,
                        symptoms: data.symptoms ? JSON.stringify(data.symptoms) : undefined,
                        severity: data.severity,
                        requiresDoctorVisit: data.requiresDoctorVisit,
                        isEmergency: data.isEmergency,
                        advice: data.advice
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.conditions.id, id))
                        .returning()
                        .then(function (rows) { return rows[0]; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Delete a condition
 */
function deleteCondition(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.delete(schema_1.conditions).where((0, drizzle_orm_1.eq)(schema_1.conditions.id, id))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
