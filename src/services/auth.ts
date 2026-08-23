import type { ApiResult } from "@/lib/api/response";
import type { AuthenticatedUser } from "@/lib/auth/session";

/**
 * UI qatlami hech qachon `fetch` ni to'g'ridan-to'g'ri chaqirmaydi.
 * Barcha so'rovlar shu servis orqali o'tadi — API o'zgarsa, bitta joy o'zgaradi.
 */

export type LoginInput = { email: string; password: string };

export type LoginResult =
  | { ok: true; user: { id: string; email: string; fullName: string } }
  | { ok: false; message: string };

async function readJson<T>(response: Response): Promise<ApiResult<T> | null> {
  try {
    return (await response.json()) as ApiResult<T>;
  } catch {
    return null;
  }
}

export async function login(input: LoginInput): Promise<LoginResult> {
  let response: Response;

  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return {
      ok: false,
      message: "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.",
    };
  }

  const payload = await readJson<{
    id: string;
    email: string;
    fullName: string;
  }>(response);

  if (!payload) {
    return { ok: false, message: "Serverdan noto'g'ri javob keldi." };
  }

  if (!payload.ok) {
    return { ok: false, message: payload.error.message };
  }

  return { ok: true, user: payload.data };
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
}

export async function fetchCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const response = await fetch("/api/auth/me");
    const payload = await readJson<AuthenticatedUser>(response);

    return payload?.ok ? payload.data : null;
  } catch {
    return null;
  }
}
