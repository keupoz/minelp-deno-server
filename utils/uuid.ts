import { UUIDInfo, UUIDInfoSchema } from "../schemas/uuid.ts";
import { UtilResponse } from "./response.ts";
import { TemplateFunction } from "./template.ts";

export type UUIDInfoResponse = UtilResponse<UUIDInfo>;

export async function getUUID(
  url: TemplateFunction,
  nickname: string,
): Promise<UUIDInfoResponse> {
  try {
    const r = await fetch(url(nickname));
    const json = await r.json();
    const data = UUIDInfoSchema.safeParse(json);

    if (data.success) {
      return { response: data.data };
    }

    return { error: data.error };
  } catch (_err) {
    return { error: null };
  }
}
