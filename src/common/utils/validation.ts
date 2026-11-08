import { z } from "zod";
import mongoose from "mongoose";
import { GenderEnum, LanguageEnum } from "../enum";

const translateObj = {
  username: {
    ar: "لا يمكن القبول باسم مستخدم أقل من حرفين",
    en: "Minimum allowed length is 2 characters",
  },
};

const matchField = ({
  original,
  copy,
  data,
  ctx,
  lang,
}: {
  original: string;
  copy: string;
  data: any;
  ctx: z.RefinementCtx;
  lang?: LanguageEnum;
}) => {
  if (data[original] !== data[copy]) {
    ctx.addIssue({
      code: "custom",
      path: [copy],
      message:
        lang === LanguageEnum.AR
          ? `تعذر تطابق كلا من ${original}, ${copy}`
          : `Fields '${original}' and '${copy}' do not match`,
    });
  }
};

export const generalValidationFields = {
  matchField,

  email: (lang: LanguageEnum) => z.email(),
  gender: (lang: LanguageEnum) => z.enum(GenderEnum),
  otp: (lang: LanguageEnum) =>
    z.string().regex(/^\d{6}$/, {
      error: "Invalid code",
    }),

  password: (lang: LanguageEnum) =>
    z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
      ),

  username: (lang: LanguageEnum) =>
    z.string().min(2, {
      message:
        lang === LanguageEnum.AR
          ? translateObj.username.ar
          : translateObj.username.en,
    }),

  phone: (lang: LanguageEnum) => z.e164(),
  id: (lang: LanguageEnum) =>
    z.string().refine((data) => mongoose.Types.ObjectId.isValid(data), {
      message: "Invalid ObjectId",
    }),

  file: (lang: LanguageEnum) =>
    z.strictObject({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      buffer: z.instanceof(Buffer),
      size: z.number(),
      path: z.string(),
    }),
};