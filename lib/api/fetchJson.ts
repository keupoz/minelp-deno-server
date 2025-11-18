import { StandardSchemaV1 } from "@standard-schema/spec";
import { parseData } from "../utils/parseData.ts";
import { strictFetch } from "./strictFetch.ts";

export async function fetchJson<TResponse>(
  url: string,
  schema: StandardSchemaV1<unknown, TResponse>,
  notFoundErrorCode: Parameters<typeof strictFetch>[1],
  signal?: AbortSignal,
) {
  const response = await strictFetch(url, notFoundErrorCode, signal);
  const json = await response.json();

  return parseData(json, schema);
}
