import { TexturesSchema } from "../schemas/textures.ts";
import { template } from "../utils/template.ts";
import { fetchProfileTexture } from "../utils/texture.ts";
import { ServerHandler } from "./index.ts";

const URL = template`http://skins.minelittlepony-mod.com/api/v1/user/${"UUID"}`;

export const VALHALLA_SERVER: ServerHandler = async (uuid, textureType) => {
  try {
    const r = await fetch(URL(uuid));

    if (!r.ok) return null;

    const json = await r.json();
    const data = TexturesSchema.safeParse(json);

    if (data.success) {
      return await fetchProfileTexture(data.data, textureType);
    }

    return { error: data.error };
  } catch (err) {
    return { error: err };
  }
};
