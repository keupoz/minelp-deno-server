import { ZodError } from "zod";

export type UtilResponse<T> =
  | { response: T }
  | { error: ZodError | null };
