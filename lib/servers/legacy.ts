import { APIError } from "../api/APIError.ts";
import { strictFetch } from "../api/strictFetch.ts";
import { TextureFetcher } from "./types.ts";

export const fetchLegacyTexture: TextureFetcher = async (uuid, textureType, signal) => {
  if (textureType !== "skin") throw new APIError("UNSUPPORTED_TYPE");

  const url = `http://skins.voxelmodpack.com/skins/${uuid}.png`;
  const response = await strictFetch(url, "NO_SKIN", signal);
  const value = await response.arrayBuffer();

  return { value, model: "unknown" };
};
