import { template } from "../utils/template.ts";
import { ServerHandler } from "./index.ts";

const URL = template`http://skins.voxelmodpack.com/skins/${"UUID"}.png`;

export const LEGACY_SERVER: ServerHandler = async (uuid) => {
  try {
    const r = await fetch(URL(uuid));

    if (r.status !== 200) {
      return null;
    }

    const buffer = await r.arrayBuffer();

    return { response: { buffer, model: "unknown" } };
  } catch (err) {
    return { error: err };
  }
};
