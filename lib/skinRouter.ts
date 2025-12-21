import { os } from "@orpc/server";
import { z } from "zod";
import { APIError } from "./api/APIError.ts";
import { fetchUUID } from "./api/fetchUUID.ts";
import { fetchLegacyTexture } from "./servers/legacy.ts";
import { fetchMojangTexture } from "./servers/mojang.ts";
import { TextureData, TextureFetcher } from "./servers/types.ts";
import { fetchValhallaTexture } from "./servers/valhalla.ts";

export const SERVERS: Record<string, TextureFetcher> = {
  valhalla: fetchValhallaTexture,
  legacy: fetchLegacyTexture,
  mojang: fetchMojangTexture,
};

export const SkinServerInputSchema = z.object({
  server: z.string(),
  nickname: z.string(),
  textureType: z.string(),
});

export const ExactOutputSchema = z.object({
  headers: z.object({
    "X-Nickname": z.string(),
    "X-Model": z.string(),
  }),
  body: z.file().mime("image/png"),
});

export const AnyOutputSchema = z.object({
  headers: z.object({
    "X-Server": z.string(),
    "X-Nickname": z.string(),
    "X-Model": z.string(),
  }),
  body: z.file().mime("image/png"),
});

interface DetailedOutput<T> {
  status?: number;
  headers?: Record<string, string | string[]>;
  body?: T;
}

async function handleExact(server: string, nickname: string, textureType: string, signal?: AbortSignal) {
  const fetchTexture = SERVERS[server];

  if (!fetchTexture) throw new APIError("UNKNOWN_SERVER");

  const uuidObject = await fetchUUID(nickname, signal);
  const textureData = await fetchTexture(uuidObject.id, textureType, signal);

  return {
    headers: {
      "X-Nickname": uuidObject.name,
      "X-Model": textureData.model ?? "default",
    },
    body: new File([textureData.value], `${uuidObject.name}.png`, {
      type: "image/png",
    }),
  } satisfies DetailedOutput<File>;
}

async function handleAny(nickname: string, textureType: string, signal?: AbortSignal) {
  const uuidObject = await fetchUUID(nickname, signal);

  let result: [string, TextureData] | undefined;

  for (const [serverName, fetchTexture] of Object.entries(SERVERS)) {
    try {
      result = [serverName, await fetchTexture(uuidObject.id, textureType, signal)];
    } catch (error) {
      if (signal?.aborted) throw new APIError("ABORTED");
      if (error instanceof APIError && error.code === "NO_SKIN") continue;
    }
  }

  if (!result) throw new APIError("NO_SKIN");

  const [serverName, textureData] = result;

  return {
    headers: {
      "X-Server": serverName,
      "X-Nickname": uuidObject.name,
      "X-Model": textureData.model ?? "default",
    },
    body: new File([textureData.value], `${uuidObject.name}.png`, {
      type: "image/png",
    }),
  } satisfies DetailedOutput<File>;
}

export const exactRoute = os
  .route({ method: "GET", path: "/exact/{server}/{nickname}", outputStructure: "detailed" })
  .input(SkinServerInputSchema.pick({ server: true, nickname: true }))
  .output(ExactOutputSchema)
  .handler(({ input, signal }) => {
    return handleExact(input.server, input.nickname, "skin", signal);
  });

export const exactRouteWithTexture = os
  .route({ method: "GET", path: "/exact/{server}/{nickname}/{textureType}", outputStructure: "detailed" })
  .input(SkinServerInputSchema)
  .output(ExactOutputSchema)
  .handler(({ input, signal }) => {
    return handleExact(input.server, input.nickname, input.textureType, signal);
  });

export const anyRoute = os
  .route({ method: "GET", path: "/any/{nickname}", outputStructure: "detailed" })
  .input(SkinServerInputSchema.pick({ nickname: true }))
  .output(AnyOutputSchema)
  .handler(({ input, signal }) => {
    return handleAny(input.nickname, "skin", signal);
  });

export const anyRouteWithTexture = os
  .route({ method: "GET", path: "/any/{nickname}/{textureType}", outputStructure: "detailed" })
  .input(SkinServerInputSchema.pick({ nickname: true, textureType: true }))
  .output(AnyOutputSchema)
  .handler(({ input, signal }) => {
    return handleAny(input.nickname, input.textureType, signal);
  });

// TODO Test errors
export const skinRouter = os.prefix("/skin").router({
  exact: exactRoute,
  exactWithTexture: exactRouteWithTexture,
  anyServer: anyRoute,
  anyServerWithTexture: anyRouteWithTexture,
});
