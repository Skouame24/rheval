// ============================================================
// components/ui/Table.tsx
// Table générique typée
// ============================================================

import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";
import { EmptyState } from "./EmptyState";
import { FileTextIcon } from "./Icons";

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
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export function Table<T>({
  columns, data, loading = false,
  emptyMessage = "Aucune donnée disponible",
  emptyIcon,
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
            Array.from({ length: 5 }).map((_, r) => (
              <tr key={r} className="border-b border-gray-100">
                {columns.map((col, c) => (
                  <td key={String(col.key || c)} className="py-4 px-4">
                    <div className="h-4 bg-slate-200/80 animate-shimmer rounded-none w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <EmptyState
                  icon={emptyIcon || <FileTextIcon size={24} className="text-slate-400" />}
                  title={emptyMessage}
                />
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
