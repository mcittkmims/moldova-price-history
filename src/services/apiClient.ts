import { PUBLIC_API_BASE_URL } from "../lib/client-env";

type CsrfPayload = {
  headerName: string;
  token: string;
  expiresAt?: string;
};

let csrfPromise: Promise<CsrfPayload> | null = null;

const networkError = () => new Error("Could not reach the server. Check your connection and try again.");

const requestError = (error: unknown) => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("failed to fetch") || message.includes("fetch failed")) {
      return networkError();
    }

    return error;
  }

  return new Error("Request failed. Please try again.");
};

const readErrorDetail = async (response: Response) => {
  try {
    const payload = (await response.json()) as { detail?: string; message?: string };
    return payload.detail ?? payload.message ?? null;
  } catch {
    return null;
  }
};

export const responseError = async (response: Response) => {
  const detail = await readErrorDetail(response);
  if (detail) {
    return new Error(detail);
  }

  if (response.status === 401) {
    return new Error("Your session expired. Sign in again.");
  }

  if (response.status === 403) {
    return new Error("You do not have permission to do that.");
  }

  if (response.status === 404) {
    return new Error("The requested resource was not found.");
  }

  if (response.status >= 500) {
    return new Error("The server could not complete that request. Please try again.");
  }

  return new Error("Could not complete that request.");
};

const fetchCsrf = async () => {
  let response: Response;
  try {
    response = await fetch(`${PUBLIC_API_BASE_URL}/api/csrf`, {
      credentials: "include",
    });
  } catch (error) {
    throw requestError(error);
  }

  if (!response.ok) {
    throw await responseError(response);
  }

  return response.json() as Promise<CsrfPayload>;
};

const ensureCsrf = (forceRefresh: boolean = false) => {
  if (forceRefresh) {
    csrfPromise = null;
  }

  if (csrfPromise == null) {
    csrfPromise = fetchCsrf().catch((error) => {
      csrfPromise = null;
      throw error;
    });
  }

  return csrfPromise;
};

const clearCsrfToken = () => {
  csrfPromise = null;
};

const shouldRetryCsrf = async (response: Response) => {
  if (response.status !== 403) {
    return false;
  }

  const detail = await readErrorDetail(response.clone());
  return detail?.toLowerCase().includes("csrf") ?? false;
};

type ApiFetchOptions = {
  skipCsrf?: boolean;
};

const doFetch = async (path: string, init: RequestInit, csrf: CsrfPayload | null) => {
  const headers = new Headers(init.headers);
  if (csrf) {
    headers.set(csrf.headerName, csrf.token);
  }

  try {
    return await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch (error) {
    throw requestError(error);
  }
};

export const apiFetch = async (
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
) => {
  const method = (init.method ?? "GET").toUpperCase();
  const requiresCsrf =
    !options.skipCsrf && !["GET", "HEAD", "OPTIONS"].includes(method);

  const send = async (forceRefreshCsrf: boolean = false) => {
    if (!requiresCsrf) {
      return doFetch(path, init, null);
    }

    const csrf = await ensureCsrf(forceRefreshCsrf);
    return doFetch(path, init, csrf);
  };

  let response = await send();

  if (response.status === 401) {
    clearCsrfToken();
    return response;
  }

  if (requiresCsrf && await shouldRetryCsrf(response)) {
    clearCsrfToken();
    response = await send(true);

    if (response.status === 401) {
      clearCsrfToken();
    }
  }

  return response;
};

export const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const primeCsrfToken = async () => {
  await ensureCsrf(true);
};

export const resetCsrfToken = () => {
  clearCsrfToken();
};
