import { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";

export async function parseData<TOutput>(data: unknown, schema: StandardSchemaV1<unknown, TOutput>) {
  const result = await schema["~standard"].validate(data);

  if (result.issues) {
    throw new SchemaError(result.issues);
  }

  return result.value;
}
