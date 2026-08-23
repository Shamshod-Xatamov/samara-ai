import { jwtVerify, SignJWT } from "jose";

/**
 * Bu fayl `proxy.ts` (edge runtime) ichida ham ishlatiladi.
 * Shuning uchun bu yerda Prisma yoki Node-only kutubxonalar BO'LMASLIGI kerak.
 */

export const SESSION_COOKIE = "samara_session";

export type SessionPayload = {
  sessionId: string;
  userId: string;
  orgId: string;
};

function getSigningKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET topilmadi yoki juda qisqa. Kamida 32 belgi bo'lishi kerak (`openssl rand -base64 32`).",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload,
  expiresAt: Date,
) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSigningKey());
}

/**
 * Faqat imzo va muddatni tekshiradi — bazaga murojaat qilmaydi.
 * Bu "optimistik tekshiruv": proxy'da tez ishlaydi, lekin yakuniy
 * haqiqat manbai emas. Haqiqiy tekshiruv `session.ts` da, baza orqali.
 */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sessionId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.orgId !== "string"
    ) {
      return null;
    }

    return {
      sessionId: payload.sessionId,
      userId: payload.userId,
      orgId: payload.orgId,
    };
  } catch {
    return null;
  }
}
