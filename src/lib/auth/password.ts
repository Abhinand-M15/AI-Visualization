/** Client-side password rules and a simple strength hint (not a guarantee). */

export const MIN_PASSWORD_LENGTH = 8;

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: "Too short",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

export function passwordStrength(password: string): PasswordStrength {
  if (password.length < MIN_PASSWORD_LENGTH) return 0;
  let score = 0;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  // Long passphrases are strong even without symbol variety.
  if (password.length >= 16) score = Math.max(score, 3);
  return Math.min(4, Math.max(1, score)) as PasswordStrength;
}

/** Returns an error message, or null when the password is acceptable. */
export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (passwordStrength(password) < 2) {
    return "That password is easy to guess. Add upper and lower case letters, numbers or symbols.";
  }
  if (password !== confirm) return "The two passwords don't match.";
  return null;
}
