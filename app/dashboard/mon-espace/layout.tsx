// app/dashboard/salarie/layout.tsx
import { AppShell } from "@/components/layout/AppShell";

export default function SalarieLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="SALARIE" userName="Amara Diallo" userEmail="amara.diallo@agilly.com" notifCount={1}>
      {children}
    </AppShell>
  );
}
