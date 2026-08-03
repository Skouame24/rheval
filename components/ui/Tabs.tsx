// ============================================================
// components/ui/Tabs.tsx
// ============================================================

"use client";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface Tab {
  key: string;
  label: string;
  icon?: string;
  badge?: number;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (key: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);

  const handleChange = (key: string) => {
    setActive(key);
    onChange?.(key);
  };

  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "var(--neutral-100)" }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => handleChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-white shadow-sm text-[var(--agilly-blue-800)]"
                  : "text-[var(--neutral-500)] hover:text-[var(--neutral-700)]"
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white"
                  style={{ background: isActive ? "var(--agilly-blue-600)" : "var(--neutral-400)" }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab?.content}
      </div>
    </div>
  );
}
