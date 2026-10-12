import type { ReactNode } from "react";
import { ThemeSwitcher } from "../components/theme-switcher";

type AuthLayoutProps = { children: ReactNode };

/** Full-screen centered stage, used by the login panel and status screens. */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative grid min-h-screen place-items-center bg-[radial-gradient(circle_at_12%_12%,var(--color-teal-soft),transparent_25rem)] p-6">
      {/* ThemeSwitcher is `relative` itself (it anchors its menu), so the corner placement lives on a wrapper. */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6"><ThemeSwitcher /></div>
      {children}
    </main>
  );
}
