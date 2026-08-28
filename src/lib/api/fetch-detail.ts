import { ApiError } from "./client";

/*
 * Resolves a detail-page request, distinguishing "this record does not exist"
 * from "we could not reach the API".
 *
 * Only a genuine 404 returns null (so the page can call notFound()). Anything
 * else — a network failure, a 500 — is rethrown for the route's error boundary
 * to handle: telling a visitor the page does not exist when the API is simply
 * down is both wrong and unrecoverable, since a 404 offers them no retry.
 */
export async function fetchDetail<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
