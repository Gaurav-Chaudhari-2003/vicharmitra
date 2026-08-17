"use client";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/vm-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/vm-button";
import { getUserProfile } from "@/lib/auth";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const profile = typeof window !== "undefined" ? getUserProfile() : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-5">
      <h1 className="text-2xl font-bold text-text-main">Settings & Tenant Workspace</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your Vicharmitra AI account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-muted">Name</label>
            <Input defaultValue={profile?.full_name || profile?.name || ""} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted">Email</label>
            <Input defaultValue={profile?.email || ""} disabled className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Your tenant / institutional library name.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input defaultValue={profile?.tenant_name || "My Library"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Toggle between light and dark academic themes.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
            Light
          </Button>
          <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
            Dark
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
