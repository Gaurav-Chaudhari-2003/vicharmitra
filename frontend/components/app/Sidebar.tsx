"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Search,
  MessageSquare,
  Tags,
  StickyNote,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { clearTokens } from "@/lib/auth";

const NAV = [
  { href: "/library", label: "Library Shelf", icon: BookOpen },
  { href: "/search", label: "Cross-Book Discovery", icon: Search },
  { href: "/workspace", label: "Grounded Q&A Workspace", icon: MessageSquare },
  { href: "/catalogs", label: "Subject Catalogs", icon: Tags },
  { href: "/notes", label: "Notes & Citations", icon: StickyNote },
  { href: "/settings", label: "Settings & Tenant", icon: Settings },
];

export function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <Link href="/library" className="flex items-center gap-2.5 px-1 mb-8">
        <img src="/vicharmitra-logo.svg" alt="Vicharmitra" className="h-8 w-8 shrink-0" />
        {!collapsed && <span className="text-lg font-bold vm-gradient-text">Vicharmitra AI</span>}
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary/15 text-primary-light shadow-[0_0_16px_rgba(99,102,241,0.15)]"
                  : "text-text-muted hover:bg-surface-glass hover:text-text-main"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-border pt-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-glass hover:text-text-main transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => {
            clearTokens();
            router.replace("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col shrink-0 vm-glass border-r border-border p-4 transition-all duration-300",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <SidebarNav collapsed={collapsed} />
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-md hover:text-primary transition-colors"
      >
        {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
      </button>
    </aside>
  );
}
