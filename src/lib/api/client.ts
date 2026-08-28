import { getAccessToken } from "@/lib/auth";
import type { ApiErrorBody, PaginatedResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

function buildUrl(path: string, params?: ApiFetchOptions["params"]): string {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { success?: unknown }).success === false &&
    "error" in value
  );
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { params, headers, body, ...rest } = options;

  // No customer accounts in phase 1: getAccessToken() resolves to null today,
  // but the header is already wired so future auth needs no client refactor.
  const token = await getAccessToken();

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new ApiError("Unable to reach the API server.", "NETWORK_ERROR", 0, cause);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new ApiError(payload.error.message, payload.error.code, response.status, payload.error.details);
    }
    throw new ApiError(
      `Request to ${path} failed with status ${response.status}.`,
      "UNKNOWN_ERROR",
      response.status,
    );
  }

  return payload as T;
}

export async function apiList<T>(
  path: string,
  params?: ApiFetchOptions["params"],
): Promise<PaginatedResponse<T>> {
  return apiFetch<PaginatedResponse<T>>(path, { params });
}

/**
 * Resolves a paginated list request to its `results`, swallowing failures.
 * Homepage sections use this so a down/unreachable backend degrades to an
 * empty section instead of crashing the whole page render.
 */
export async function safeResults<T>(request: Promise<PaginatedResponse<T>>): Promise<T[]> {
  try {
    const data = await request;
    return data.results;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[api] request failed, returning empty results:", error);
    }
    return [];
  }
}

/**
 * Same degradation as `safeResults`, for the unpaginated action endpoints
 * (`/offers/active/`, `/flights/featured/`, ...) that answer with a bare array
 * instead of the paginated envelope.
 */
export async function safeArray<T>(request: Promise<T[]>): Promise<T[]> {
  try {
    return await request;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[api] request failed, returning empty results:", error);
    }
    return [];
  }
}
