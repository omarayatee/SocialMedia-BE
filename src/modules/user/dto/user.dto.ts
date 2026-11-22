import z from "zod";
import { searchValidation, updateProfileValidation } from "./../user.validation";

export type UpdateProfileDto = z.infer<ReturnType<typeof updateProfileValidation>>["body"];
export type SearchDto = z.infer<ReturnType<typeof searchValidation>>["query"];