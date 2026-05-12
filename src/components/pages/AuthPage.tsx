"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

type AuthPageMode = "login" | "register";

type AuthPageProps = {
  mode: AuthPageMode;
};

type AuthFieldErrors = {
  username?: string;
  password?: string;
};

export function AuthPage({ mode }: AuthPageProps) {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const { tr } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const content = mode === "login"
    ? {
        title: tr.auth_login_title,
        submitLabel: tr.auth_login_submit,
        alternateLabel: tr.auth_login_alt_label,
        alternateHref: tr.auth_login_alt_href,
        alternateText: tr.auth_login_alt_text,
      }
    : {
        title: tr.auth_register_title,
        submitLabel: tr.auth_register_submit,
        alternateLabel: tr.auth_register_alt_label,
        alternateHref: tr.auth_register_alt_href,
        alternateText: tr.auth_register_alt_text,
      };

  const nextPath = useMemo(() => {
    const next = searchParams?.get("next");
    return next && next.startsWith("/") ? next : "/home";
  }, [searchParams]);
  const hasNextParam = searchParams?.get("next") != null;

  const validateUsername = (value: string) => {
    const u = value.trim();
    if (!u) return tr.auth_username_required;
    if (u.length < 3 || u.length > 40) return tr.auth_username_length;
    if (!/^[a-zA-Z0-9._-]+$/.test(u)) return tr.auth_username_chars;
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value) return tr.auth_password_required;
    if (value.length < 8 || value.length > 72) return tr.auth_password_length;
    return null;
  };

  const validateCredentials = (u: string, p: string): AuthFieldErrors => {
    const errors: AuthFieldErrors = {};
    const uErr = validateUsername(u);
    const pErr = validatePassword(p);
    if (uErr) errors.username = uErr;
    if (pErr) errors.password = pErr;
    return errors;
  };

  const hasFieldErrors = (errors: AuthFieldErrors) =>
    Object.values(errors).some((v) => v != null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const nextFieldErrors = validateCredentials(username, password);
    setFieldErrors(nextFieldErrors);

    if (hasFieldErrors(nextFieldErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      const trimmedUsername = username.trim();
      if (mode === "login") {
        await login(trimmedUsername, password);
      } else {
        await register(trimmedUsername, password);
      }

      router.push(nextPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : tr.auth_fallback_error;
      if (message.toLowerCase().startsWith("username")) {
        setFieldErrors((current) => ({ ...current, username: message }));
      } else if (message.toLowerCase().startsWith("password")) {
        setFieldErrors((current) => ({ ...current, password: message }));
      } else {
        setErrorMessage(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoading && isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[420px] items-center">
        <div className="w-full rounded-lg border border-ink-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-normal">
              {tr.auth_signed_in}
            </h1>
            <div className="flex flex-col gap-2">
              <Link
                href={nextPath}
                className="inline-flex h-10 items-center justify-center rounded-md bg-ink-900 px-4 text-sm text-white transition-colors hover:bg-ink-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300"
              >
                {tr.auth_continue}
              </Link>
              <Link
                href="/search"
                className="inline-flex h-10 items-center justify-center rounded-md border border-ink-200 bg-white px-4 text-sm text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                {tr.auth_browse}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[420px] items-center">
      <section className="w-full rounded-lg border border-ink-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]">
        <div className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">
              {content.title}
            </h1>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium">
                {tr.auth_username_label}
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setUsername(nextValue);
                  setErrorMessage(null);
                  setFieldErrors((current) => ({
                    ...current,
                    username: current.username ? validateUsername(nextValue) ?? undefined : current.username,
                  }));
                }}
                onBlur={() =>
                  setFieldErrors((current) => ({
                    ...current,
                    username: validateUsername(username) ?? undefined,
                  }))
                }
                aria-invalid={fieldErrors.username != null}
                className="h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900 dark:border-neutral-700 dark:bg-[#111111] dark:text-neutral-100"
                placeholder={tr.auth_username_placeholder}
                minLength={3}
                maxLength={40}
                pattern="^[a-zA-Z0-9._-]+$"
                title={tr.auth_username_title}
                required
              />
              {fieldErrors.username ? (
                <p className="text-sm text-rust-700 dark:text-rust-100">
                  {fieldErrors.username}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium">
                {tr.auth_password_label}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setPassword(nextValue);
                  setErrorMessage(null);
                  setFieldErrors((current) => ({
                    ...current,
                    password: current.password ? validatePassword(nextValue) ?? undefined : current.password,
                  }));
                }}
                onBlur={() =>
                  setFieldErrors((current) => ({
                    ...current,
                    password: validatePassword(password) ?? undefined,
                  }))
                }
                aria-invalid={fieldErrors.password != null}
                className="h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900 dark:border-neutral-700 dark:bg-[#111111] dark:text-neutral-100"
                placeholder={tr.auth_password_placeholder}
                minLength={8}
                maxLength={72}
                required
              />
              {fieldErrors.password ? (
                <p className="text-sm text-rust-700 dark:text-rust-100">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-sm text-rust-700 dark:border-rust-700 dark:bg-[#2b170d] dark:text-rust-100">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading || submitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-ink-900 px-4 text-sm text-white transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:bg-ink-700/70 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300 dark:disabled:bg-neutral-300/70"
            >
              {submitting ? tr.auth_working : content.submitLabel}
            </button>
          </form>

          <div className="flex items-center justify-between gap-3 border-t border-ink-200 pt-4 text-sm dark:border-neutral-800">
            <span className="text-ink-500 dark:text-neutral-400">
              {content.alternateText}
            </span>
            <Link
              href={`${content.alternateHref}${hasNextParam ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
              className="font-medium text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
            >
              {content.alternateLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
