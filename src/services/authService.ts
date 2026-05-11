import { apiFetch, primeCsrfToken, resetCsrfToken, responseError } from "./apiClient";
import type { AuthSession } from "../types/auth";

type AuthCredentials = {
  username: string;
  password: string;
};

const postCredentials = async (path: string, body: AuthCredentials) => {
  const response = await apiFetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, {
    skipCsrf: true,
  });

  if (!response.ok) {
    throw await responseError(response);
  }

  const session = await response.json() as AuthSession;
  resetCsrfToken();
  await primeCsrfToken().catch(() => undefined);
  return session;
};

const postWithoutBody = async (path: string) => {
  const response = await apiFetch(path, {
    method: "POST",
  });

  if (!response.ok) {
    throw await responseError(response);
  }
};

export const authService = {
  register(credentials: AuthCredentials) {
    return postCredentials("/api/auth/register", credentials);
  },

  login(credentials: AuthCredentials) {
    return postCredentials("/api/auth/login", credentials);
  },

  async getSession() {
    const response = await apiFetch("/api/auth/session");

    if (response.status === 204 || response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw await responseError(response);
    }

    return response.json() as Promise<AuthSession>;
  },

  async logout() {
    try {
      await postWithoutBody("/api/auth/logout");
    } finally {
      resetCsrfToken();
    }
  },
};
