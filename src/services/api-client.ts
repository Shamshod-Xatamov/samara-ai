import type { ApiResult } from "@/lib/api/response";

/**
 * UI uchun yagona fetch qatlami.
 * Har qanday xato — tarmoq, server, format — bir xil shaklda qaytadi,
 * shuning uchun komponentlarda `try/catch` yozilmaydi.
 */

export type ClientResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ClientResult<T>> {
  let response: Response;

  try {
    response = await fetch(path, init);
  } catch {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.",
    };
  }

  let payload: ApiResult<T> | null = null;

  try {
    payload = (await response.json()) as ApiResult<T>;
  } catch {
    payload = null;
  }

  if (!payload) {
    return {
      ok: false,
      code: "INVALID_RESPONSE",
      message: "Serverdan noto'g'ri javob keldi.",
    };
  }

  if (!payload.ok) {
    return {
      ok: false,
      code: payload.error.code,
      message: payload.error.message,
    };
  }

  return { ok: true, data: payload.data };
}

export function jsonRequest<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
) {
  return apiRequest<T>(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
