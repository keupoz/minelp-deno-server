import { PathParams } from "sift";

export interface SkinPathParams {
  server: string | undefined;
  nickname: string | undefined;
  textureType: string;
}

export function parseParams(params: PathParams): SkinPathParams {
  const textureType = params?.textureType.toLowerCase() ?? "";

  return {
    server: params?.server,
    nickname: params?.nickname,
    textureType: textureType.length > 0 ? textureType : "skin",
  };
}
