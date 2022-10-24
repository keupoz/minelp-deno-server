import { SkinResponse } from "../utils/skin.ts";

export type ServerHandler = (uuid: string) => Promise<SkinResponse>;

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
): Promise<SkinResponse> {
  const serverHandler = REGISTRY.get(server);

  if (serverHandler === undefined) return null;

  return await serverHandler(uuid);
}

export async function fetchFirstSkin(
  uuid: string,
): Promise<[string, SkinResponse]> {
  for (const [serverName, serverHandler] of REGISTRY) {
    const response = await serverHandler(uuid);

    if (response !== null) {
      return [serverName, response];
    }
  }

  return ["", null];
}
