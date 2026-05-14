export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export function isConfiguredAdminEmail(email: string): boolean {
  return getAdminEmails().includes(normalizeEmail(email));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

