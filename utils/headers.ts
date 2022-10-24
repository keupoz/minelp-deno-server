import { json } from "https://deno.land/x/sift@0.6.0/mod.ts";

export interface ErrorResponse {
  code: string;
  error: string;
}

export type CreateErrrorResponse = (error: string) => ErrorResponse;

export function allowCORS(response: Response): void {
  response.headers.set("Access-Control-Allow-Origin", "*");
}

export function setXHeaders(
  response: Response,
  headers: Record<string, string>,
): void {
  response.headers.set(
    "Access-Control-Expose-Headers",
    Object.keys(headers).join(","),
  );

  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
}

export function err(code: string): CreateErrrorResponse {
  return (error) => ({ code, error });
}

export function errResponse(
  code: number,
  error: CreateErrrorResponse,
  msg?: unknown,
): Response {
  let msgToSend;

  if (msg === undefined || msg === null) {
    msgToSend = "No extra information";
  } else if (msg instanceof Error) {
    msgToSend = msg.message;
  } else {
    msgToSend = String(msg);
  }

  const response = json(error(msgToSend), { status: code });

  allowCORS(response);

  return response;
}
