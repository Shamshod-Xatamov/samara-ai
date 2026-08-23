/**
 * Route ro'yxati. `proxy.ts` (edge runtime) shu fayldan foydalanadi,
 * shuning uchun bu yerda hech qanday import bo'lmasligi kerak.
 */

/** Kirish talab qilinadigan platforma sahifalari. */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/malumotlar",
  "/qayta-ishlash",
  "/ai-tahlil",
  "/iqtisodiy-samaradorlik",
  "/monitoring",
  "/qarorlar",
  "/hisobotlar",
  "/sozlamalar",
] as const;

/** Kirgan foydalanuvchi bu sahifalarga qaytmasligi kerak. */
export const AUTH_ROUTES = ["/kirish"] as const;

export const LOGIN_PATH = "/kirish";
export const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

export function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAuthPath(pathname: string) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
