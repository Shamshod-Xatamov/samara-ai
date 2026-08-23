import { prisma } from "@/lib/db";

import { parseEesConfig, type EesConfig } from "./ees";

export type OrgEconomics = {
  eesConfig: EesConfig;
  /** AI joriy etish xarajati, mln so'm. Kiritilmagan bo'lsa ROI hisoblanmaydi. */
  investment: number | null;
};

export async function loadOrgEconomics(orgId: string): Promise<OrgEconomics> {
  const settings = await prisma.orgSettings.findUnique({ where: { orgId } });

  return {
    eesConfig: parseEesConfig(settings?.eesConfig),
    investment:
      settings?.aiInvestmentCost != null
        ? Number(settings.aiInvestmentCost)
        : null,
  };
}
