import type { ColumnProfile, TableProfile } from "./profile";

export type IssueType = "MISSING" | "DUPLICATE" | "TYPE_ERROR" | "OUTLIER";
export type IssueSeverity = "HIGH" | "MEDIUM" | "LOW";

export type DetectedIssue = {
  columnName: string | null;
  issueType: IssueType;
  count: number;
  affectedPct: number;
  severity: IssueSeverity;
  /** Deterministik tavsiya — tozalash moduli aynan shuni bajaradi. */
  suggestedFix: string;
};

export const ISSUE_LABELS: Record<IssueType, string> = {
  MISSING: "Bo'sh qiymatlar",
  DUPLICATE: "Dublikatlar",
  TYPE_ERROR: "Tip xatolari",
  OUTLIER: "Outlierlar",
};

function severityFromShare(share: number): IssueSeverity {
  if (share >= 3) return "HIGH";
  if (share >= 1) return "MEDIUM";
  return "LOW";
}

function missingFix(column: ColumnProfile) {
  switch (column.dataType) {
    case "NUMBER":
      // Median o'rtachadan ko'ra outlier'ga chidamli.
      return "Ustun medianasi bilan to'ldirish";
    case "DATE":
      return "Sana tiklab bo'lmasa, qatorni chiqarib tashlash";
    case "BOOLEAN":
      return "Eng ko'p uchraydigan qiymat bilan to'ldirish";
    default:
      return "\"Aniqlanmagan\" qiymati bilan to'ldirish";
  }
}

function typeErrorFix(column: ColumnProfile) {
  switch (column.dataType) {
    case "NUMBER":
      return "Raqam formatiga o'tkazish (vergul va ajratgichlarni tozalash)";
    case "DATE":
      return "Sanani ISO formatiga keltirish";
    case "BOOLEAN":
      return "Mantiqiy qiymatga keltirish (ha / yo'q)";
    default:
      return "Qiymatni matn sifatida standartlashtirish";
  }
}

export function detectIssues(profile: TableProfile): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const { rowCount } = profile;

  if (rowCount === 0) return issues;

  for (const column of profile.columns) {
    if (column.nullCount > 0) {
      const share = (column.nullCount / rowCount) * 100;

      issues.push({
        columnName: column.sourceName,
        issueType: "MISSING",
        count: column.nullCount,
        affectedPct: Math.round(share * 100) / 100,
        severity: severityFromShare(share),
        suggestedFix: missingFix(column),
      });
    }

    if (column.invalidCount > 0) {
      const share = (column.invalidCount / rowCount) * 100;

      issues.push({
        columnName: column.sourceName,
        issueType: "TYPE_ERROR",
        count: column.invalidCount,
        affectedPct: Math.round(share * 100) / 100,
        // Umuman o'qib bo'lmagan qiymat — har doim jiddiy.
        severity: share >= 1 ? "HIGH" : "MEDIUM",
        suggestedFix: `${typeErrorFix(column)}; o'qib bo'lmasa bo'sh deb belgilash`,
      });
    }

    if (column.coercedCount > 0) {
      const share = (column.coercedCount / rowCount) * 100;

      issues.push({
        columnName: column.sourceName,
        issueType: "TYPE_ERROR",
        count: column.coercedCount,
        affectedPct: Math.round(share * 100) / 100,
        // Avtomatik tuzatiladi, shuning uchun bir daraja past.
        severity: share >= 3 ? "MEDIUM" : "LOW",
        suggestedFix: typeErrorFix(column),
      });
    }

    if (column.outlierCount > 0) {
      const share = (column.outlierCount / rowCount) * 100;

      issues.push({
        columnName: column.sourceName,
        issueType: "OUTLIER",
        count: column.outlierCount,
        affectedPct: Math.round(share * 100) / 100,
        // Outlier har doim xato emas — haqiqiy holat ham bo'lishi mumkin.
        severity: share >= 3 ? "MEDIUM" : "LOW",
        suggestedFix: "IQR chegarasida yumshatish (winsorization)",
      });
    }
  }

  if (profile.duplicateRowIndexes.length > 0) {
    const share = (profile.duplicateRowIndexes.length / rowCount) * 100;

    issues.push({
      columnName: null,
      issueType: "DUPLICATE",
      count: profile.duplicateRowIndexes.length,
      affectedPct: Math.round(share * 100) / 100,
      severity: share >= 1 ? "HIGH" : "MEDIUM",
      suggestedFix: "Takroriy yozuvlarni olib tashlash (birinchi nusxa saqlanadi)",
    });
  }

  // Eng jiddiy va eng ko'p uchraydigani birinchi ko'rsatiladi.
  const severityOrder: Record<IssueSeverity, number> = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2,
  };

  return issues.sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity] ||
      b.count - a.count,
  );
}

/** UI'dagi 4 ta jamlangan karta uchun. */
export function summarizeIssues(issues: DetectedIssue[]) {
  const summary: Record<IssueType, number> = {
    MISSING: 0,
    DUPLICATE: 0,
    TYPE_ERROR: 0,
    OUTLIER: 0,
  };

  for (const issue of issues) {
    summary[issue.issueType] += issue.count;
  }

  return summary;
}
