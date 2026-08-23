import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const loginSchema = z.object({
  email: z.email("Email manzil noto'g'ri formatda").trim(),
  password: z.string().min(1, "Parolni kiriting"),
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiFail(
      ApiErrorCode.invalidJson,
      "So'rov formati noto'g'ri.",
      400,
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return apiFail(
      ApiErrorCode.validation,
      "Kiritilgan ma'lumotda xatolik bor.",
      422,
      z.treeifyError(parsed.error),
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  const isPasswordValid = user
    ? await verifyPassword(user.passwordHash, parsed.data.password)
    : false;

  // Foydalanuvchi topilmagani va parol noto'g'riligi bir xil javob beradi —
  // aks holda qaysi emaillar mavjudligini aniqlab olish mumkin bo'lardi.
  if (!user || !isPasswordValid || !user.isActive) {
    return apiFail(
      ApiErrorCode.invalidCredentials,
      "Email yoki parol noto'g'ri.",
      401,
    );
  }

  await createSession(
    { id: user.id, orgId: user.orgId },
    {
      userAgent: request.headers.get("user-agent"),
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return apiOk({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });
});
