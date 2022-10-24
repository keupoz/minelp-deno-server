import { TexturesInfo } from "../schemas/textures.ts";

export type SkinResponse =
  | {
    response: {
      skin: ArrayBuffer;
      model: string;
    };
  }
  | { error: unknown }
  | null;

export async function fetchSkinTexture(
  tx: TexturesInfo,
): Promise<SkinResponse> {
  const texture = tx.textures.SKIN;

  if (texture === undefined) return null;

  try {
    const r = await fetch(texture.url);

    if (r.status !== 200) {
      return null;
    }

    const skin = await r.arrayBuffer();
    const model = texture.metadata?.model ?? "default";

    return { response: { skin, model } };
  } catch (err) {
    return { error: err };
  }
}
