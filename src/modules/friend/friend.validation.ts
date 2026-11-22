import z from "zod";
import { FriendRequestActionEnum, LanguageEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utils";

export const respondRequestValidation = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      userId: generalValidationFields.id(lang),
    }),
    body: z.strictObject({
      action: z.enum(FriendRequestActionEnum),
    }),
  });
};

export const userIdValidation = (lang: LanguageEnum) => {
  return z.object({
    params: z.strictObject({
      userId: generalValidationFields.id(lang),
    }),
  });
};

export const listValidation = (lang: LanguageEnum) => {
  return z.object({
    query: z.strictObject({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    }),
  });
};

export const suggestionsValidation = (lang: LanguageEnum) => {
  return z.object({
    query: z.strictObject({
      limit: z.coerce.number().int().min(1).max(50).default(10),
    }),
  });
};