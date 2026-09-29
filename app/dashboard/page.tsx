"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    const targetRole = role || user.role || "SALARIE";
    const targetDashboard = ROLE_DASHBOARD[targetRole] || "/dashboard/mon-espace";
    router.replace(targetDashboard);
  }, [user, role, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-agilly-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500 font-medium">Redirection vers votre espace...</p>
      </div>
    </div>
  );
}
