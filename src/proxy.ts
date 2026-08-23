import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  isAuthPath,
  isProtectedPath,
} from "@/config/routes";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";

/**
 * Optimistik tekshiruv: bu yerda faqat cookie imzosi tekshiriladi, bazaga
 * murojaat qilinmaydi (proxy har bir so'rovda, prefetch'larda ham ishlaydi).
 * Yakuniy tekshiruv API qatlamida `getCurrentUser()` orqali bajariladi.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (isProtectedPath(pathname) && !session) {
    const redirectUrl = new URL(LOGIN_PATH, request.nextUrl);
    // Kirgandan keyin foydalanuvchi xohlagan sahifaga qaytariladi.
    redirectUrl.searchParams.set("keyin", pathname);

    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPath(pathname) && session) {
    return NextResponse.redirect(
      new URL(DEFAULT_AUTHENTICATED_PATH, request.nextUrl),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
