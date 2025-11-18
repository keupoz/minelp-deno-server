import { ORPCError } from "@orpc/server";

const ERRORS = {
  ABORTED: [499, "Request aborted"],
  INTERNAL_ERROR: [500, "Internal error"],
  UNKNOWN_SERVER: [400, "Unknown server provided"],
  UNSUPPORTED_TYPE: [400, "Unsupported texture type"],
  NO_PROFILE: [404, "No profile found"],
  NO_SKIN: [404, "No texture found"],
} satisfies Record<string, [number, string]>;

export class APIError<TCode extends keyof typeof ERRORS> extends ORPCError<TCode, unknown> {
  constructor(code: TCode) {
    const [status, message] = ERRORS[code];
    super(code, { status, message });
  }
}
