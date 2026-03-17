import { createProfileApi, type User } from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

const profileApi = createProfileApi(mobileApiClient);

export async function getProfile(): Promise<User> {
  const response = await profileApi.getProfile();

  return response.data;
}
