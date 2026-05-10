"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

type AuthPageMode = "login" | "register";

type AuthPageProps = {
  mode: AuthPageMode;
};

type AuthFieldErrors = {
  username?: string;
  password?: string;
};

const contentByMode: Record<AuthPageMode, {
  title: string;
  submitLabel: string;
  alternateLabel: string;
  alternateHref: string;
  alternateText: string;
}> = {
  login: {
    title: "Sign in",
    submitLabel: "Sign in",
    alternateLabel: "Create account",
    alternateHref: "/register",
    alternateText: "Need an account?",
  },
  register: {
    title: "Register",
    submitLabel: "Create account",
    alternateLabel: "Sign in",
    alternateHref: "/login",
    alternateText: "Already registered?",
  },
};

const validateUsername = (value: string) => {
  const username = value.trim();

  if (!username) {
    return "Username is required.";
  }

  if (username.length < 3 || username.length > 40) {
    return "Username must be between 3 and 40 characters.";
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return "Use letters, numbers, dots, underscores, or hyphens only.";
  }

  return null;
};

const validatePassword = (value: string) => {
  if (!value) {
    return "Password is required.";
  }

  if (value.length < 8 || value.length > 72) {
    return "Password must be between 8 and 72 characters.";
  }

  return null;
};

const validateCredentials = (username: string, password: string): AuthFieldErrors => {
  const fieldErrors: AuthFieldErrors = {};
  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);

  if (usernameError) {
    fieldErrors.username = usernameError;
  }

  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  return fieldErrors;
};

const hasFieldErrors = (fieldErrors: AuthFieldErrors) =>
  Object.values(fieldErrors).some((value) => value != null);

export function AuthPage({ mode }: AuthPageProps) {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const content = contentByMode[mode];
  const nextPath = useMemo(() => {
    const next = searchParams?.get("next");
    return next && next.startsWith("/") ? next : "/home";
  }, [searchParams]);
  const hasNextParam = searchParams?.get("next") != null;

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
      const message = error instanceof Error ? error.message : "Could not complete that request.";
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

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[420px] items-center">
        <div className="w-full rounded-lg border border-ink-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]">
          <p className="text-sm text-ink-600 dark:text-neutral-300">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[420px] items-center">
        <div className="w-full rounded-lg border border-ink-200 bg-white p-6 dark:border-neutral-800 dark:bg-[#171717]">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-normal">
              Signed in
            </h1>
            <div className="flex flex-col gap-2">
              <Link
                href={nextPath}
                className="inline-flex h-10 items-center justify-center rounded-md bg-ink-900 px-4 text-sm text-white transition-colors hover:bg-ink-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300"
              >
                Continue
              </Link>
              <Link
                href="/search"
                className="inline-flex h-10 items-center justify-center rounded-md border border-ink-200 bg-white px-4 text-sm text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Browse products
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
                Username
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
                placeholder="Username"
                minLength={3}
                maxLength={40}
                pattern="^[a-zA-Z0-9._-]+$"
                title="Use 3 to 40 letters, numbers, dots, underscores, or hyphens."
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
                Password
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
                placeholder="Password"
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
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-ink-900 px-4 text-sm text-white transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:bg-ink-700/70 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300 dark:disabled:bg-neutral-300/70"
            >
              {submitting ? "Working..." : content.submitLabel}
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
