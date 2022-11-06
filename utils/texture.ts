import { TexturesInfo } from "../schemas/textures.ts";

export interface TextureResponseSuccessful {
  response: {
    buffer: ArrayBuffer;
    model: string;
  };
}

export type TextureResponse =
  | TextureResponseSuccessful
  | { error: unknown }
  | null;

export async function fetchProfileTexture(
  tx: TexturesInfo,
  textureType: string,
): Promise<TextureResponse> {
  const texture = tx.textures[textureType];

  if (texture === undefined) return null;

  try {
    const r = await fetch(texture.url);

    if (r.status !== 200) {
      return null;
    }

    const buffer = await r.arrayBuffer();
    const model = texture.metadata?.model ?? "default";

    return { response: { buffer, model } };
  } catch (err) {
    return { error: err };
  }
}
