import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { format } from "@std/fmt/duration";
import { APIError } from "./lib/api/APIError.ts";
import { skinRouter } from "./lib/skinRouter.ts";

const handler = new OpenAPIHandler(skinRouter, {
  plugins: [
    new CORSPlugin({ exposeHeaders: ["X-Server", "X-Nickname", "X-Model"] }),
    new OpenAPIReferencePlugin({
      docsProvider: "swagger",
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      if (error instanceof APIError && error.code !== "INTERNAL_ERROR") return;
      if (error instanceof Error && error.name === "AbortError") return;

      console.error(error);
    }),
  ],
  customErrorResponseBodyEncoder(error) {
    return {
      code: error.code,
      error: error.message,
    };
  },
});

Deno.serve(async (request) => {
  const started = Date.now();
  const handleResult = await handler.handle(request);
  const duration = Date.now() - started;

  const response = handleResult.matched ? handleResult.response : new Response("Not Found", { status: 404 });

  const requestUrl = new URL(request.url);
  const requestPath = requestUrl.pathname + requestUrl.search;
  const formattedDuration = format(duration, { ignoreZero: true });
  const status = request.signal.aborted ? "ABORTED" : response.status;

  console.info([request.method, requestPath, formattedDuration, status].join(" "));

  return response;
});
