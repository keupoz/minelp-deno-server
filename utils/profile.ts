import { Profile, ProfileSchema } from "../schemas/profile.ts";
import { UtilResponse } from "./response.ts";
import { TemplateFunction } from "./template.ts";

export type ProfileResponse = UtilResponse<Profile>;

export async function getProfile(
  url: TemplateFunction,
  uuid: string,
): Promise<ProfileResponse> {
  try {
    const r = await fetch(url(uuid));
    const json = await r.json();
    const data = ProfileSchema.safeParse(json);

    if (data.success) {
      return { response: data.data };
    }

    return { error: data.error };
  } catch (_err) {
    return { error: null };
  }
}
