import z from "zod";
import { updateProfileValidation } from "./../user.validation";

export type UpdateProfileDto = z.infer<ReturnType<typeof updateProfileValidation>>["body"];