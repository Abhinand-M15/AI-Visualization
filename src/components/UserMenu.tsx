import { Suspense } from "react";
import { authEnabled, getCurrentUser } from "@/lib/auth/session";
import { UserMenuDropdown } from "@/lib/auth/UserMenuDropdown";

/**
 * Signed-in user's menu (name/email, Settings, Sign out), fixed next to the
 * ThemeToggle. Renders nothing when AUTH_ENABLED is off (and then touches no
 * cookies, so pages stay exactly as they are today) or when nobody is signed in.
 * The session lookup sits behind <Suspense> so it never holds up the page.
 */
export function UserMenu() {
  if (!authEnabled()) return null;
  return (
    <Suspense fallback={null}>
      <SignedInUserMenu />
    </Suspense>
  );
}

async function SignedInUserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <UserMenuDropdown displayName={user.displayName ?? ""} email={user.email} />;
}
