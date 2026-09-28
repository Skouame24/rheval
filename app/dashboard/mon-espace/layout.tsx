// app/dashboard/salarie/layout.tsx
import { AppShell } from "@/components/layout/AppShell";

export default function SalarieLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
