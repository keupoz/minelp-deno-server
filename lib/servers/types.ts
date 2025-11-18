export interface TextureData {
  value: ArrayBuffer;
  model?: string;
}

export type TextureFetcher = (uuid: string, textureType: string, signal?: AbortSignal) => Promise<TextureData>;
