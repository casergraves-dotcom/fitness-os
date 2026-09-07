interface AuthIdentity {
  email?: string | null;
  user_metadata?: {
    display_name?: unknown;
    full_name?: unknown;
  } | null;
}


function normalizeName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}


function formatEmailName(email: string): string | null {
  const localPart = email.split("@")[0]?.trim();

  if (!localPart) {
    return null;
  }

  const words = localPart
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return null;
  }

  return words
    .map((word) =>
      `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    )
    .join(" ");
}


export function getAuthUserDisplayName(
  user: AuthIdentity | null | undefined,
): string | null {
  return (
    normalizeName(user?.user_metadata?.display_name) ??
    normalizeName(user?.user_metadata?.full_name) ??
    (user?.email ? formatEmailName(user.email) : null)
  );
}
