"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = void 0;
const calculateAge = (dob) => {
    if (!dob)
        return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getUTCFullYear() - birth.getUTCFullYear();
    const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) {
        age--;
    }
    return age;
};
exports.calculateAge = calculateAge;
