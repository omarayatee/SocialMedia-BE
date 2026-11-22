import z from "zod";
import { listValidation, respondRequestValidation, suggestionsValidation } from "../friend.service";


export type ListDto = z.infer<ReturnType<typeof listValidation>>["query"];
export type SuggestionsDto = z.infer<ReturnType<typeof suggestionsValidation>>["query"];
export type RespondRequestDto = z.infer<ReturnType<typeof respondRequestValidation>>["body"];