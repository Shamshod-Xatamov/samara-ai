import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  ApiErrorCode,
  apiFail,
  apiOk,
  withApiErrorHandling,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import {
  DEFAULT_EES_CONFIG,
  EES_COMPONENT_KEYS,
  EES_COMPONENT_LABELS,
  parseEesConfig,
} from "@/lib/economics/ees";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  ANALYST: "Analitik",
  VIEWER: "Kuzatuvchi",
};

const thresholdsSchema = z.object({
  latency: z.number().min(0).max(60_000),
  errorRate: z.number().min(0).max(100),
  aiAccuracy: z.number().min(0).max(100),
  costIncrease: z.number().min(0).max(100),
});

const notificationsSchema = z.object({
  inApp: z.boolean(),
  criticalEmail: z.boolean(),
  warningEmail: z.boolean(),
  dailySummary: z.boolean(),
  weeklyReport: z.boolean(),
  sound: z.boolean(),
});

const updateSchema = z.object({
  profile: z
    .object({
      fullName: z.string().trim().min(2).max(120).optional(),
      language: z.string().trim().min(2).max(40).optional(),
    })
    .optional(),
  organization: z
    .object({
      name: z.string().trim().min(2).max(160).optional(),
      sector: z.string().trim().min(2).max(120).optional(),
      timezone: z.string().trim().min(2).max(120).optional(),
      currency: z.string().trim().min(2).max(120).optional(),
    })
    .optional(),
  thresholds: thresholdsSchema.partial().optional(),
  notifications: notificationsSchema.partial().optional(),
  economics: z
    .object({
      /** AI joriy etish xarajati, mln so'm. ROI shunga bo'linadi. */
      aiInvestmentCost: z.number().min(0).max(1_000_000).nullable().optional(),
      /** Bazaviy (AI'gacha) davr uzunligi, kun */
      baselineDays: z.number().int().min(7).max(365).optional(),
      /** EES komponentlari vazni; yig'indisi 1 ga normallashtiriladi */
      eesWeights: z
        .object({
          time: z.number().min(0).max(1),
          cost: z.number().min(0).max(1),
          labor: z.number().min(0).max(1),
          automation: z.number().min(0).max(1),
          quality: z.number().min(0).max(1),
        })
        .partial()
        .optional(),
    })
    .optional(),
});

async function loadSettings(orgId: string, userId: string) {
  const [user, organization, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.orgSettings.findUnique({ where: { orgId } }),
  ]);

  if (!user || !organization) return null;

  const eesConfig = parseEesConfig(settings?.eesConfig);

  return {
    profile: {
      fullName: user.fullName,
      email: user.email,
      role: ROLE_LABELS[user.role] ?? user.role,
      language: user.language,
    },
    organization: {
      name: organization.name,
      sector: organization.sector,
      timezone: organization.timezone,
      currency: organization.currency,
    },
    thresholds: (settings?.thresholds ?? {
      latency: 500,
      errorRate: 2,
      aiAccuracy: 92,
      costIncrease: 15,
    }) as z.infer<typeof thresholdsSchema>,
    notifications: (settings?.notifications ?? {
      inApp: true,
      criticalEmail: true,
      warningEmail: true,
      dailySummary: false,
      weeklyReport: true,
      sound: false,
    }) as z.infer<typeof notificationsSchema>,
    economics: {
      aiInvestmentCost:
        settings?.aiInvestmentCost != null
          ? Number(settings.aiInvestmentCost)
          : null,
      baselineDays: eesConfig.baselineDays ?? 60,
      eesWeights: eesConfig.weights,
      /** UI'da vaznlar yonida ko'rsatiladigan nomlar */
      eesLabels: EES_COMPONENT_LABELS,
    },
  };
}

export const GET = withApiErrorHandling(async () => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const settings = await loadSettings(guard.user.organization.id, guard.user.id);

  if (!settings) {
    return apiFail(ApiErrorCode.notFound, "Sozlamalar topilmadi.", 404);
  }

  return apiOk(settings);
});

export const PATCH = withApiErrorHandling(async (request: NextRequest) => {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiFail(ApiErrorCode.invalidJson, "So'rov formati noto'g'ri.", 400);
  }

  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return apiFail(
      ApiErrorCode.validation,
      "Kiritilgan qiymatlarda xatolik bor.",
      422,
      z.treeifyError(parsed.error),
    );
  }

  const orgId = guard.user.organization.id;
  const input = parsed.data;

  if (input.profile) {
    await prisma.user.update({
      where: { id: guard.user.id },
      data: {
        fullName: input.profile.fullName,
        language: input.profile.language,
      },
    });
  }

  if (input.organization) {
    await prisma.organization.update({
      where: { id: orgId },
      data: input.organization,
    });
  }

  if (input.thresholds || input.notifications || input.economics) {
    const existing = await prisma.orgSettings.findUnique({ where: { orgId } });
    const eesConfig = parseEesConfig(existing?.eesConfig);

    let weights = eesConfig.weights;

    if (input.economics?.eesWeights) {
      const merged = { ...weights, ...input.economics.eesWeights };
      const total = EES_COMPONENT_KEYS.reduce(
        (sum, key) => sum + (merged[key] ?? 0),
        0,
      );

      // Vaznlar yig'indisi 1 bo'lishi shart — foydalanuvchi kiritgan
      // qiymatlar shu shartga keltiriladi.
      weights =
        total > 0
          ? (Object.fromEntries(
              EES_COMPONENT_KEYS.map((key) => [
                key,
                Math.round(((merged[key] ?? 0) / total) * 1000) / 1000,
              ]),
            ) as typeof weights)
          : DEFAULT_EES_CONFIG.weights;
    }

    const nextEesConfig = {
      ...eesConfig,
      weights,
      baselineDays: input.economics?.baselineDays ?? eesConfig.baselineDays ?? 60,
    };

    await prisma.orgSettings.upsert({
      where: { orgId },
      update: {
        ...(input.thresholds
          ? {
              thresholds: {
                ...(existing?.thresholds as object),
                ...input.thresholds,
              },
            }
          : {}),
        ...(input.notifications
          ? {
              notifications: {
                ...(existing?.notifications as object),
                ...input.notifications,
              },
            }
          : {}),
        eesConfig: nextEesConfig,
        ...(input.economics?.aiInvestmentCost !== undefined
          ? { aiInvestmentCost: input.economics.aiInvestmentCost }
          : {}),
      },
      create: {
        orgId,
        thresholds: input.thresholds ?? {},
        notifications: input.notifications ?? {},
        eesConfig: nextEesConfig,
        aiInvestmentCost: input.economics?.aiInvestmentCost ?? null,
      },
    });
  }

  const settings = await loadSettings(orgId, guard.user.id);

  if (!settings) {
    return apiFail(ApiErrorCode.internal, "Sozlamalarni o'qib bo'lmadi.", 500);
  }

  return apiOk(settings);
});
