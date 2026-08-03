// ============================================================
// lib/utils/cn.ts
// Helper pour combiner les classes Tailwind conditionnellement
// ============================================================

type ClassValue = string | undefined | null | false | Record<string, boolean>;

export function cn(...classes: ClassValue[]): string {
  return classes
    .flatMap((cls) => {
      if (!cls) return [];
      if (typeof cls === "string") return [cls];
      return Object.entries(cls)
        .filter(([, active]) => active)
        .map(([name]) => name);
    })
    .join(" ");
}
