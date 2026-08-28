// Phase 1 ships no customer login UI. This stub exists so lib/api/client.ts
// has a stable hook to attach an Authorization header once accounts land.
export async function getAccessToken(): Promise<string | null> {
  return null;
}
