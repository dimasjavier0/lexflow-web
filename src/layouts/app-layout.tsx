import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import { ThemeSwitcher } from "../components/theme-switcher";
import { Button, buttonClasses } from "../components/ui";
import { useAuth } from "../contexts/auth-context";
import { cn } from "../lib/cn";
import { LEGAL_LINKS } from "../lib/legal";
import { isAndroidApp } from "../lib/site";

type AppLayoutProps = {
  children: ReactNode;
  /** Replaces the default brand + session bar. */
  topbar?: ReactNode;
  /** "split" is narrow on small screens and widens for a two-column layout on desktop. */
  width?: "wide" | "narrow" | "split";
  className?: string;
};

function AppTopbar() {
  const { apiUser, isAuthenticated, signOut } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <BrandMark />
      <nav className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1" aria-label="Navegación principal">
        {apiUser?.role === "ADMIN" ? <Link className={buttonClasses({ variant: "secondary", size: "sm" })} to="/admin">Panel admin</Link> : null}
        {isAuthenticated ? <Link className={buttonClasses({ variant: "ghost", size: "sm" })} to="/review">Repasar</Link> : null}
        {isAuthenticated ? <Link className={buttonClasses({ variant: "ghost", size: "sm" })} to="/profile">Mi progreso</Link> : null}
        {isAuthenticated ? <Link className={buttonClasses({ variant: "ghost", size: "sm" })} to="/friends">Amigos</Link> : null}
        {isAuthenticated ? (
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>Salir</Button>
        ) : (
          <Link className={buttonClasses({ variant: "ghost", size: "sm" })} to="/login">Iniciar sesión</Link>
        )}
        <ThemeSwitcher className="ml-1" />
      </nav>
    </header>
  );
}

const WIDTH_CLASSES = {
  wide: "max-w-5xl xl:max-w-6xl 2xl:max-w-7xl",
  narrow: "max-w-3xl",
  split: "max-w-3xl lg:max-w-6xl",
};

export function AppLayout({ children, topbar, width = "wide", className }: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen px-4 pt-6 pb-16 sm:px-6 lg:px-10", className)}>
      <div className={cn("mx-auto", WIDTH_CLASSES[width])}>
        {topbar ?? <AppTopbar />}
        <main>{children}</main>
        <footer className="mt-16 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-muted">
          <span>LexFlow English</span>
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Sobre LexFlow">
            {[{ to: "/about", label: "Sobre mí" }, ...(isAndroidApp() ? [] : [{ to: "/donate", label: "Apoyar el proyecto" }]), ...LEGAL_LINKS].map((link) => (
              <Link key={link.to} className="text-muted underline-offset-2 hover:text-ink hover:underline" to={link.to}>{link.label}</Link>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
