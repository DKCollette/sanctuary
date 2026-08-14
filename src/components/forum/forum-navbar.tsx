"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Search, User, Home, BookOpen, Shield, Sparkles } from "lucide-react";

export default function ForumNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle navigation"
          >
            {showMobileNav ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            href="/"
            className="text-lg font-serif text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
          >
            <span className="text-xl wings-aura">Collettive</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/forum" icon={<Home size={14} />} label="Home" isActive={pathname === "/forum"} />
          <NavLink href="/forum/search" icon={<Search size={14} />} label="Discover" isActive={isActive("/forum/search")} />
          <NavLink href="/forum/principles" icon={<BookOpen size={14} />} label="Principles" isActive={pathname === "/forum/principles"} />
          <span className="w-px h-4 bg-border mx-1.5" />
          <NavLink href="/" icon={<span className="text-xs">⌂</span>} label="Main" isActive={pathname === "/"} />
          <NavLink href="/pulse" icon={<Sparkles size={14} color="#a78bfa" />} label="Pulse" isActive={false} />
          <NavLink href="/profile" icon={<User size={14} color="#2dd4bf" />} label="Sanctuary" isActive={false} />
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
          <Link
            href="/forum/profile"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            aria-label="Profile"
          >
            <User size={18} />
          </Link>
        </div>
      </div>

      {showMobileNav && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-4 py-2 space-y-1">
          <MobileNavLink href="/forum" label="🏠 Home" />
          <MobileNavLink href="/forum/search" label="🔍 Discover" />
          <MobileNavLink href="/forum/principles" label="📖 Principles" />
          <MobileNavLink href="/forum/profile" label="👤 My Profile" />
          <MobileNavLink href="/" label="← Main Sanctuary" />
        </div>
      )}
    </header>
  );
}

function NavLink({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
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