// ============================================================
// components/ui/Table.tsx
// Table générique typée
// ============================================================

import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export function Table<T>({
  columns, data, loading = false,
  emptyMessage = "Aucune donnée disponible",
  emptyIcon = "📋",
  onRowClick,
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border" style={{ borderColor: "var(--neutral-200)" }}>
      <table className="w-full border-collapse">
        {/* Head */}
        <thead>
          <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-200)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{
                  color: "var(--neutral-500)",
                  width: col.width,
                  textAlign: col.align ?? "left",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <span className="text-sm" style={{ color: "var(--neutral-400)" }}>Chargement...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{emptyIcon}</span>
                  <span className="text-sm" style={{ color: "var(--neutral-400)" }}>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors duration-100",
                  onRowClick && "cursor-pointer hover:bg-[var(--agilly-blue-50)]",
                  idx % 2 === 0 ? "bg-white" : "bg-[var(--neutral-50)]"
                )}
                style={{ borderBottom: "1px solid var(--neutral-100)" }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3.5 text-sm"
                    style={{ color: "var(--neutral-700)", textAlign: col.align ?? "left" }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
