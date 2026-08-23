import { apiOk, withApiErrorHandling } from "@/lib/api/response";
import { destroyCurrentSession } from "@/lib/auth/session";

export const POST = withApiErrorHandling(async () => {
  await destroyCurrentSession();

  return apiOk({ loggedOut: true });
});
