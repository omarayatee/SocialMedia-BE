"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../enum");
const translateObj = {
    username: {
        ar: "لا يمكن القبول باسم مستخدم أقل من حرفين",
        en: "Minimum allowed length is 2 characters",
    },
};
const matchField = ({ original, copy, data, ctx, lang, }) => {
    if (data[original] !== data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: lang === enum_1.LanguageEnum.AR
                ? `تعذر تطابق كلا من ${original}, ${copy}`
                : `Fields '${original}' and '${copy}' do not match`,
        });
    }
};
exports.generalValidationFields = {
    matchField,
    email: (lang) => zod_1.z.email(),
    gender: (lang) => zod_1.z.enum(enum_1.GenderEnum),
    otp: (lang) => zod_1.z.string().regex(/^\d{6}$/, {
        error: "Invalid code",
    }),
    password: (lang) => zod_1.z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/),
    username: (lang) => zod_1.z.string().min(2, {
        message: lang === enum_1.LanguageEnum.AR
            ? translateObj.username.ar
            : translateObj.username.en,
    }),
    phone: (lang) => zod_1.z.e164(),
    id: (lang) => zod_1.z.string().refine((data) => mongoose_1.default.Types.ObjectId.isValid(data), {
        message: "Invalid ObjectId",
    }),
    file: (lang) => zod_1.z.strictObject({
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        buffer: zod_1.z.instanceof(Buffer),
        size: zod_1.z.number(),
        path: zod_1.z.string(),
    }),
};
