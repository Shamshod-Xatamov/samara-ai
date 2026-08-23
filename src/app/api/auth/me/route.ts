import {
  apiOk,
  apiUnauthorized,
  withApiErrorHandling,
} from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/session";

export const GET = withApiErrorHandling(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return apiUnauthorized("Sessiya topilmadi yoki muddati tugagan.");
  }

  return apiOk(user);
});
