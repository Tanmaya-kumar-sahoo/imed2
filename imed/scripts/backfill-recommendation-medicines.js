"use strict";
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
var db_1 = require("../src/lib/db");
var medicines_1 = require("../src/lib/db/schema/medicines");
var turso_medicine_service_1 = require("../src/lib/services/turso-medicine-service");
var drizzle_orm_1 = require("drizzle-orm");
function backfillRecommendationMedicines() {
    return __awaiter(this, void 0, void 0, function () {
        var allRecs, _loop_1, _i, allRecs_1, rec;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(medicines_1.recommendations)];
                case 1:
                    allRecs = _a.sent();
                    _loop_1 = function (rec) {
                        var existing, medicineList;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, db_1.db.select().from(medicines_1.recommendationMedicines).where((0, drizzle_orm_1.eq)(medicines_1.recommendationMedicines.recommendationId, rec.id))];
                                case 1:
                                    existing = _b.sent();
                                    if (existing.length > 0)
                                        return [2 /*return*/, "continue"]; // Already has medicines
                                    medicineList = [];
                                    if (!rec.conditionId) return [3 /*break*/, 3];
                                    return [4 /*yield*/, (0, turso_medicine_service_1.getMedicinesForCondition)(rec.conditionId)];
                                case 2:
                                    medicineList = _b.sent();
                                    _b.label = 3;
                                case 3:
                                    // If no medicines found, skip
                                    if (!medicineList || medicineList.length === 0) {
                                        console.log("No medicines found for recommendation ".concat(rec.id));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // Insert associations
                                    return [4 /*yield*/, db_1.db.insert(medicines_1.recommendationMedicines).values(medicineList.map(function (med) { return ({
                                            recommendationId: rec.id,
                                            medicineId: med.id,
                                        }); }))];
                                case 4:
                                    // Insert associations
                                    _b.sent();
                                    console.log("Backfilled medicines for recommendation ".concat(rec.id));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, allRecs_1 = allRecs;
                    _a.label = 2;
                case 2:
                    if (!(_i < allRecs_1.length)) return [3 /*break*/, 5];
                    rec = allRecs_1[_i];
                    return [5 /*yield**/, _loop_1(rec)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
backfillRecommendationMedicines()
    .then(function () {
    console.log("Backfill complete!");
    process.exit(0);
})
    .catch(function (err) {
    console.error("Error during backfill:", err);
    process.exit(1);
});
