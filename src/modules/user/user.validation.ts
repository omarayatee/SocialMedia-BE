import { z } from "zod";
import { LanguageEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utils";

export const updateProfileValidation = (lang: LanguageEnum) => {
  return z.object({
    body: z
      .strictObject({
        username: generalValidationFields
          .username(lang)
          .regex(/^\S{2,}\s+\S{2,}$/, { message: "Username must be first and last name" })
          .optional(),
        phone: generalValidationFields.phone(lang).optional(),
        gender: generalValidationFields.gender(lang).optional(),
        DOB: z.coerce.date().max(new Date(), { message: "Invalid date of birth" }).optional(),
      })
      .refine((data) => Object.keys(data).length > 0, { message: "Send at least one field to update" }),
  });
};

export const getProfileValidation = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      userId: generalValidationFields.id(lang),
    }),
  });
};