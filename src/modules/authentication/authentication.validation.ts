import { LanguageEnum } from "../../common/enum";
import { z } from "zod";
import { generalValidationFields } from "../../common/utils";


//base schema for service
const loginBodySchema = (lang: LanguageEnum) => {
  return z.strictObject({
    email:  generalValidationFields.email(lang),
    password:  generalValidationFields.password(lang),
  });
};

export const loginValidation = (lang: LanguageEnum) => {
  return z.object({
    body: loginBodySchema(lang),
  });
};

export const signupValidation = (lang: LanguageEnum) => {
  return z.object({
    body: loginBodySchema(lang)
      .safeExtend({
        username:  generalValidationFields.username(lang),
        phone:  generalValidationFields.phone(lang),
        password:  generalValidationFields.password(lang),
        confirmPassword:  generalValidationFields.password(lang),
        gender:  generalValidationFields.gender(lang),
      })
      .superRefine((data, ctx) => {
         generalValidationFields.matchField({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};

export const confirmEmail = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email:  generalValidationFields.email(lang),
      otp:  generalValidationFields.otp(lang),
    }),
  });
};

export const resendConfirmEmail = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email:  generalValidationFields.email(lang),
    }),
  });
};