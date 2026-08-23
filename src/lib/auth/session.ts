import { cookies } from "next/headers";

import { prisma } from "@/lib/db";

import {
  SESSION_COOKIE,
  signSessionToken,
  verifySessionToken,
} from "./jwt";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  language: string;
  organization: {
    id: string;
    name: string;
    sector: string;
    timezone: string;
    currency: string;
  };
};

export async function createSession(
  user: { id: string; orgId: string },
  meta: { userAgent?: string | null; ipAddress?: string | null } = {},
) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
    },
  });

  const token = await signSessionToken(
    { sessionId: session.id, userId: user.id, orgId: user.orgId },
    expiresAt,
  );

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return session;
}

/**
 * Haqiqiy tekshiruv: cookie imzosi + bazadagi sessiya + foydalanuvchi holati.
 * Chiqarilgan sessiya bazadan o'chirilgan bo'lsa, bu yerda rad etiladi.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
  );

  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: { include: { org: true } } },
  });

  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  if (!session.user.isActive) return null;

  const { user } = session;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    language: user.language,
    organization: {
      id: user.org.id,
      name: user.org.name,
      sector: user.org.sector,
      timezone: user.org.timezone,
      currency: user.org.currency,
    },
  };
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);

  if (payload) {
    // Sessiya allaqachon o'chirilgan bo'lishi mumkin — bu xato emas.
    await prisma.session
      .deleteMany({ where: { id: payload.sessionId } })
      .catch(() => undefined);
  }

  cookieStore.delete(SESSION_COOKIE);
}
