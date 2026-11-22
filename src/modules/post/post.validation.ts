import z from "zod";
import { LanguageEnum } from "../../common/enum";

export const createPostValidation = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({ content: z.string().trim().max(5000).optional() }).default({}),
  });
};