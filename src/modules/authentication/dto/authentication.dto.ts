import z from "zod";
import { confirmEmail, loginValidation, resendConfirmEmail, signupValidation } from "../authentication.validation";

export type SignupDto = z.infer<ReturnType<typeof signupValidation>>;
export type ConfirmEmailDto = z.infer<ReturnType<typeof confirmEmail>>["body"];
export type ResendConfirmEmailDto = z.infer<ReturnType<typeof resendConfirmEmail>>["body"];
export type LoginDto = z.infer<ReturnType<typeof loginValidation>>["body"];