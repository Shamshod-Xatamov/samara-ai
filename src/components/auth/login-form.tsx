"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email manzilni kiriting")
    .email("Email manzil noto'g'ri formatda"),
  password: z
    .string()
    .min(1, "Parolni kiriting")
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

type LoginValues = z.infer<typeof loginSchema>;

const fieldClassName =
  "h-12 w-full rounded-md border border-border bg-surface pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-muted";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    await new Promise((resolve) => setTimeout(resolve, 650));

    sessionStorage.setItem(
      "ai-samaradorlik-foydalanuvchi",
      JSON.stringify({ email: values.email }),
    );

    router.push("/dashboard");
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="email">
          Email manzil
        </label>

        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ism@tashkilot.uz"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`${fieldClassName} ${
              errors.email
                ? "border-danger focus:border-danger focus:ring-danger/10"
                : ""
            }`}
            disabled={isSubmitting}
            {...register("email")}
          />
        </div>

        {errors.email && (
          <p id="email-error" className="text-xs font-medium text-danger" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-medium text-foreground"
          htmlFor="password"
        >
          Parol
        </label>

        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Parolingizni kiriting"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`${fieldClassName} pr-12 ${
              errors.password
                ? "border-danger focus:border-danger focus:ring-danger/10"
                : ""
            }`}
            disabled={isSubmitting}
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
            aria-pressed={showPassword}
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="size-[18px]" aria-hidden="true" />
            ) : (
              <Eye className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        </div>

        {errors.password && (
          <p
            id="password-error"
            className="text-xs font-medium text-danger"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-[background-color,transform,box-shadow] duration-150 hover:bg-primary-hover hover:shadow-md active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-[18px] animate-spin" aria-hidden="true" />
            Tekshirilmoqda...
          </>
        ) : (
          <>
            Tizimga kirish
            <ArrowRight
              className="size-[18px] transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>
    </form>
  );
}
