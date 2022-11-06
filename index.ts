import { serve } from "sift";
import { ZodError } from "zod";
import { UUIDInfo } from "./schemas/uuid.ts";
import {
  fetchFirstSkin,
  fetchSkin,
  isServerSupported,
  registerServer,
} from "./servers/index.ts";
import { LEGACY_SERVER } from "./servers/legacy.ts";
import { MOJANG_SERVER } from "./servers/mojang.ts";
import { VALHALLA_SERVER } from "./servers/valhalla.ts";
import { allowCORS, err, errResponse, setXHeaders } from "./utils/headers.ts";
import { parseParams } from "./utils/params.ts";
import { template } from "./utils/template.ts";
import { TextureResponse, TextureResponseSuccessful } from "./utils/texture.ts";
import { getUUID, UUIDInfoResponse } from "./utils/uuid.ts";

const MOJANG_ID =
  template`https://api.mojang.com/users/profiles/minecraft/${"NICKNAME"}`;

const ERRORS = {
  INTERNAL_ERROR: err("INTERNAL_ERROR"),
  UNKNOWN_SERVER: err("UNKNOWN_SERVER"),
  NO_SERVER: err("NO_SERVER"),
  NO_NICKNAME: err("NO_NICKNAME"),
  NO_PROFILE: err("NO_PROFILE"),
  NO_SKIN: err("NO_SKIN"),
};

registerServer("valhalla", VALHALLA_SERVER);
registerServer("legacy", LEGACY_SERVER);
registerServer("mojang", MOJANG_SERVER);

function parseUUIDResponse(
  nickname: string,
  response: UUIDInfoResponse,
): UUIDInfo | Response {
  if ("error" in response) {
    const { error } = response;

    if (error instanceof ZodError) {
      console.error(error);

      return errResponse(
        500,
        ERRORS.INTERNAL_ERROR,
        `Failed to parse profile response`,
      );
    }

    return errResponse(
      404,
      ERRORS.NO_PROFILE,
      `No profile for nickname "${nickname}"`,
    );
  }

  return response.response;
}

function parseTextureResponse(
  textureType: string,
  nickname: string,
  response: TextureResponse,
): TextureResponseSuccessful["response"] | Response {
  if (response === null) {
    const type = textureType === "skin"
      ? "skin"
      : `texture type "${textureType}"`;

    return errResponse(
      404,
      ERRORS.NO_SKIN,
      `No ${type} for nickname "${nickname}"`,
    );
  }

  if ("error" in response) {
    const { error } = response;

    console.error(error);

    if (error instanceof ZodError) {
      return errResponse(
        500,
        ERRORS.INTERNAL_ERROR,
        `Failed to parse skin response`,
      );
    }

    return errResponse(
      500,
      ERRORS.INTERNAL_ERROR,
      `Unexpected error`,
    );
  }

  return response.response;
}

serve({
  "/skin/exact/:server/:nickname/:textureType?": async (
    _req,
    _conn,
    params,
  ) => {
    const { server, nickname, textureType } = parseParams(params);

    if (server === undefined) return errResponse(400, ERRORS.NO_SERVER);
    if (nickname === undefined) return errResponse(400, ERRORS.NO_NICKNAME);

    if (!isServerSupported(server)) {
      return errResponse(
        400,
        ERRORS.UNKNOWN_SERVER,
        `Unsupported server: '${server}'`,
      );
    }

    const uuidInfo = parseUUIDResponse(
      nickname,
      await getUUID(MOJANG_ID, nickname),
    );

    if (uuidInfo instanceof Response) return uuidInfo;

    const texture = parseTextureResponse(
      textureType,
      nickname,
      await fetchSkin(server, uuidInfo.id, textureType),
    );

    if (texture instanceof Response) return texture;

    const response = new Response(texture.buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });

    allowCORS(response);
    setXHeaders(response, {
      "X-Nickname": uuidInfo.name,
      "X-Model": texture.model,
    });

    return response;
  },

  "/skin/any/:nickname/:textureType?": async (_req, _conn, params) => {
    const { nickname, textureType } = parseParams(params);

    if (nickname === undefined) return errResponse(400, ERRORS.NO_NICKNAME);

    const uuidInfo = parseUUIDResponse(
      nickname,
      await getUUID(MOJANG_ID, nickname),
    );

    if (uuidInfo instanceof Response) return uuidInfo;

    const [server, textureResponse] = await fetchFirstSkin(
      uuidInfo.id,
      textureType,
    );

    const texture = parseTextureResponse(
      textureType,
      nickname,
      textureResponse,
    );

    if (texture instanceof Response) return texture;

    const response = new Response(texture.buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });

    allowCORS(response);
    setXHeaders(response, {
      "X-Nickname": uuidInfo.name,
      "X-Model": texture.model,
      "X-Server": server,
    });

    return response;
  },
});
