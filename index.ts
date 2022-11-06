import { serve } from "sift";
import { ZodError } from "zod";
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
import { template } from "./utils/template.ts";
import { getUUID } from "./utils/uuid.ts";

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

serve({
  "/skin/exact/:server/:nickname": async (_req, _conn, params) => {
    const { server, nickname } = params ?? {};

    if (server === undefined) return errResponse(400, ERRORS.NO_SERVER);
    if (nickname === undefined) return errResponse(400, ERRORS.NO_NICKNAME);

    if (!isServerSupported(server)) {
      return errResponse(
        400,
        ERRORS.UNKNOWN_SERVER,
        `Unsupported server: '${server}'`,
      );
    }

    const uuidInfo = await getUUID(MOJANG_ID, nickname);

    if ("error" in uuidInfo) {
      const { error } = uuidInfo;

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

    const skin = await fetchSkin(server, uuidInfo.response.id);

    if (skin === null) {
      return errResponse(
        404,
        ERRORS.NO_SKIN,
        `No skin for nickname "${uuidInfo.response.name}"`,
      );
    }

    if ("error" in skin) {
      const { error } = skin;

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

    const response = new Response(skin.response.skin, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });

    allowCORS(response);
    setXHeaders(response, {
      "X-Nickname": uuidInfo.response.name,
      "X-Model": skin.response.model,
    });

    return response;
  },

  "/skin/any/:nickname": async (_req, _conn, params) => {
    const { nickname } = params ?? {};

    if (nickname === undefined) return errResponse(400, ERRORS.NO_NICKNAME);

    const uuidInfo = await getUUID(MOJANG_ID, nickname);

    if ("error" in uuidInfo) {
      const response = errResponse(404, ERRORS.NO_PROFILE, uuidInfo.error);
      setXHeaders(response, { "X-Nickname": nickname });
      return response;
    }

    const [server, skin] = await fetchFirstSkin(uuidInfo.response.id);

    if (skin === null || "error" in skin) {
      const response = errResponse(404, ERRORS.NO_SKIN, skin?.error);
      setXHeaders(response, { "X-Nickname": uuidInfo.response.name });
      return response;
    }

    const response = new Response(skin.response.skin, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });

    allowCORS(response);
    setXHeaders(response, {
      "X-Nickname": uuidInfo.response.name,
      "X-Model": skin.response.model,
      "X-Server": server,
    });

    return response;
  },
});
