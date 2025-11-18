import { StandardSchemaV1 } from "@standard-schema/spec";
import { parseData } from "./parseData.ts";

export async function decodeBase64<TOutput>(data: string, schema: StandardSchemaV1<unknown, TOutput>) {
  const json = JSON.parse(atob(data));
  return await parseData(json, schema);
}
