import { NextResponse } from "next/server";

export type ApiSuccess<T> = { ok: true; data: T };

export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; details?: unknown };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

/** Barcha xato kodlari shu yerda markazlashtiriladi. */
export const ApiErrorCode = {
  invalidJson: "INVALID_JSON",
  validation: "VALIDATION_ERROR",
  invalidCredentials: "INVALID_CREDENTIALS",
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  notFound: "NOT_FOUND",
  internal: "INTERNAL_ERROR",
} as const;

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export function apiFail(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json<ApiFailure>(
    { ok: false, error: { code, message, details } },
    { status },
  );
}

export function apiUnauthorized(message = "Avtorizatsiya talab qilinadi.") {
  return apiFail(ApiErrorCode.unauthorized, message, 401);
}

/**
 * Route handler'ni o'raydi: kutilmagan xato yuz bersa, stack trace
 * mijozga chiqmaydi va javob har doim bir xil formatda bo'ladi.
 */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[api] kutilmagan xato:", error);
      return apiFail(
        ApiErrorCode.internal,
        "Serverda kutilmagan xato yuz berdi. Birozdan so'ng qayta urinib ko'ring.",
        500,
      );
    }
  };
}
