import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  /**
   * Namuna fayllar serverless funksiya bundle'iga qo'shiladi.
   * `POST /api/datasets/demo` ularni diskdan o'qiydi; Vercel esa
   * import qilinmagan fayllarni avtomatik qo'shmaydi.
   */
  outputFileTracingIncludes: {
    "/api/datasets/demo": ["./namuna-malumotlar/**"],
  },
};

export default nextConfig;
