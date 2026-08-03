// ============================================================
// components/ui/Card.tsx — Soft UI Enterprise
// ============================================================

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, style, padding = "md", hoverable = false, onClick, className = "" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-none shadow-sm ${paddingMap[padding]} ${
        hoverable ? "hover:border-[#F0822A] hover:bg-[#FFF7ED]/30 cursor-pointer transition-all duration-200" : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 bg-[#FFF7ED] border border-[#F0822A]/30 rounded-none flex items-center justify-center text-[#F0822A] text-xl shrink-0">
            {icon}
          </div>
        )}

        <div>
          <h3 className="font-extrabold text-lg text-slate-900 m-0 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-400 m-0 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardDivider() {
  return <hr className="border-t border-slate-100 my-5" />;
}

export function CardSection({ children, style, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={`mt-5 ${className}`} style={style}>{children}</div>;
}

