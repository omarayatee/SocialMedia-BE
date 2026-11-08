"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendConfirmEmail = exports.confirmEmail = exports.signupValidation = exports.loginValidation = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../common/utils");
const loginBodySchema = (lang) => {
    return zod_1.z.strictObject({
        email: utils_1.generalValidationFields.email(lang),
        password: utils_1.generalValidationFields.password(lang),
    });
};
const loginValidation = (lang) => {
    return zod_1.z.object({
        body: loginBodySchema(lang),
    });
};
exports.loginValidation = loginValidation;
const signupValidation = (lang) => {
    return zod_1.z.object({
        body: loginBodySchema(lang)
            .safeExtend({
            username: utils_1.generalValidationFields.username(lang),
            phone: utils_1.generalValidationFields.phone(lang),
            password: utils_1.generalValidationFields.password(lang),
            confirmPassword: utils_1.generalValidationFields.password(lang),
            gender: utils_1.generalValidationFields.gender(lang),
        })
            .superRefine((data, ctx) => {
            utils_1.generalValidationFields.matchField({
                original: "password",
                copy: "confirmPassword",
                data,
                ctx,
                lang,
            });
        }),
    });
};
exports.signupValidation = signupValidation;
const confirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
            otp: utils_1.generalValidationFields.otp(lang),
        }),
    });
};
exports.confirmEmail = confirmEmail;
const resendConfirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
        }),
    });
};
exports.resendConfirmEmail = resendConfirmEmail;
