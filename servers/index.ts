import { TextureResponse } from "../utils/texture.ts";

export type ServerHandler = (
  uuid: string,
  textureType: string,
) => Promise<TextureResponse>;

const REGISTRY = new Map<string, ServerHandler>();

export function registerServer(name: string, handler: ServerHandler): void {
  REGISTRY.set(name, handler);
}

export function isServerSupported(name: string): boolean {
  return REGISTRY.has(name);
}

export function getServers(): IterableIterator<string> {
  return REGISTRY.keys();
}

export async function fetchSkin(
  server: string,
  uuid: string,
  textureType: string,
): Promise<TextureResponse> {
  const serverHandler = REGISTRY.get(server);

  if (serverHandler === undefined) return null;

  return await serverHandler(uuid, textureType);
}

export async function fetchFirstSkin(
  uuid: string,
  textureType: string,
): Promise<[string, TextureResponse]> {
  for (const [serverName, serverHandler] of REGISTRY) {
    const response = await serverHandler(uuid, textureType);

    if (response !== null) {
      return [serverName, response];
    }
  }

  return ["", null];
}
