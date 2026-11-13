import z from "zod";
import { LanguageEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utils";

export const followValidation = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      userId: generalValidationFields.id(lang),
    }),
  });
};

export const followListValidation = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      userId: generalValidationFields.id(lang),
    }),
    query: z.strictObject({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    }),
  });
};