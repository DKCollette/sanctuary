"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Plus, ArrowLeft } from "lucide-react";

export default function DreamShareNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isCreatePage = pathname === "/dreamshare/create";

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle navigation"
          >
            {showMobileNav ? <X size={20} /> : <Menu size={20} />}
          </button>

          {isCreatePage && (
            <Link
              href="/dreamshare"
              className="md:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={18} />
            </Link>
          )}

          <Link
            href="/dreamshare"
            className="text-lg font-serif text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">🌙</span>
            <span>DreamShare</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/dreamshare" label="Explore" isActive={pathname === "/dreamshare"} />
          <NavLink
            href="/dreamshare/create"
            label="Share"
            isActive={isCreatePage}
            icon={<Plus size={14} />}
          />
          <span className="w-px h-4 bg-border mx-1.5" />
          <NavLink href="/forum" label="Forum" isActive={false} />
          <NavLink href="/pulse" label="Pulse" isActive={false} />
          <NavLink href="/" label="Home" isActive={false} />
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
            ) : (
              <div className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>
      </div>

      {showMobileNav && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-md px-4 py-2 space-y-1">
          <MobileNavLink href="/dreamshare" label="🌙 Explore Dreams" />
          <MobileNavLink href="/dreamshare/create" label="✨ Share an Experience" />
          <MobileNavLink href="/forum" label="🌿 Forum" />
          <MobileNavLink href="/pulse" label="✨ Pulse" />
          <MobileNavLink href="/" label="← Home" />
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label, isActive, icon }: { href: string; label: string; isActive: boolean; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/80 transition-colors">
      {label}
    </Link>
  );
}