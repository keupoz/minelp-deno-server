import { APIError } from "./APIError.ts";

export async function strictFetch(
  url: string,
  notFoundErrorCode: ConstructorParameters<typeof APIError>[0],
  signal?: AbortSignal,
) {
  const response = await fetch(url, { signal });

  if (response.status === 404) throw new APIError(notFoundErrorCode);
  if (response.status === 200) return response;

  throw new Error("Failed to fetch");
}
