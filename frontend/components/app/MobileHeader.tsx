"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./Sidebar";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex md:hidden items-center justify-between border-b border-border vm-glass px-4 py-3">
      <img src="/vicharmitra-logo.svg" alt="Vicharmitra" className="h-7 w-7" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="rounded-lg p-2 text-text-main hover:bg-surface-glass">
            <Menu size={20} />
          </button>
        </SheetTrigger>
        <SheetContent side="left">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
