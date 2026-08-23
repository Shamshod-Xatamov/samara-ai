import type { NextResponse } from "next/server";

import { apiUnauthorized } from "@/lib/api/response";

import { getCurrentUser, type AuthenticatedUser } from "./session";

export type GuardResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; response: NextResponse };

/**
 * Route handler'lar uchun avtorizatsiya to'sig'i.
 * `proxy.ts` faqat optimistik tekshiruv qiladi — haqiqiy nazorat shu yerda.
 */
export async function requireUser(): Promise<GuardResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, response: apiUnauthorized() };
  }

  return { ok: true, user };
}
