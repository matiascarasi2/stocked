import type { AuthUser } from "@/lib/api/types";

export function isValidUser(user: AuthUser | null | undefined): user is AuthUser {
  return Boolean(
    user &&
      typeof user.id === "string" &&
      user.id.length > 0 &&
      typeof user.email === "string" &&
      user.email.length > 0,
  );
}
