import { z } from "zod";
import { fetchJson } from "./fetchJson.ts";

const schema = z.object({
  id: z.string(),
  name: z.string(),
});

export async function fetchUUID(nickname: string, signal?: AbortSignal) {
  const url = `https://api.mojang.com/users/profiles/minecraft/${nickname}`;
  const data = await fetchJson(url, schema, "NO_PROFILE", signal);

  return data;
}
