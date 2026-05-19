export const ADMIN_SESSION_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

export function isAdminSessionExpired(lastSignInAt: string | null | undefined): boolean {
  if (!lastSignInAt) return true;
  return Date.now() - new Date(lastSignInAt).getTime() > ADMIN_SESSION_DURATION_MS;
}
