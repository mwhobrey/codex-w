/** Display label for an authenticated user (name, else email). */
export function userDisplayName(user: { name?: string | null; email: string }): string {
  const name = user.name?.trim();
  return name || user.email;
}
