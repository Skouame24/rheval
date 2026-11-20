// ============================================================
// features/portail/components/PortailIcons.tsx
// Icônes propres au portail (trait 2px, style cohérent avec components/ui/Icons)
// ============================================================

import type { AppIconKey } from "../data/catalogue";

interface P {
  size?: number;
  className?: string;
}

function Svg({ size = 20, className, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: P) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Svg>
);
export const LogoutIcon = (p: P) => (
  <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Svg>
);
export const ArrowRightIcon = (p: P) => (
  <Svg {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Svg>
);
export const MailIcon = (p: P) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" /><path d="m3 7 9 6 9-6" /></Svg>
);
export const PhoneIcon = (p: P) => (
  <Svg {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></Svg>
);
export const ChatIcon = (p: P) => (
  <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>
);
export const CakeIcon = (p: P) => (
  <Svg {...p}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" /><path d="M2 21h20" /><path d="M7 8v3M12 8v3M17 8v3" /><path d="M7 4h.01M12 4h.01M17 4h.01" /></Svg>
);
export const SparkleIcon = (p: P) => (
  <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></Svg>
);
export const PinIcon = (p: P) => (
  <Svg {...p}><path d="M12 17v5" /><path d="M9 10.8V4h6v6.8l3 3.2H6z" /></Svg>
);
export const MegaphoneIcon = (p: P) => (
  <Svg {...p}><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></Svg>
);

export function LinkedInIcon({ size = 14, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function AppIcon({ icon, size = 22, className }: P & { icon: AppIconKey }) {
  switch (icon) {
    case "performance":
      return <Svg size={size} className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="m9 15 2 2 4-4" /></Svg>;
    case "absences":
      return <Svg size={size} className={className}><rect x="3" y="4" width="18" height="18" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="m9 16 2 2 4-4" /></Svg>;
    case "missions":
      return <Svg size={size} className={className}><rect x="2" y="7" width="20" height="14" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></Svg>;
    case "competences":
      return <Svg size={size} className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></Svg>;
    case "caisse":
      return <Svg size={size} className={className}><rect x="2" y="6" width="20" height="13" /><circle cx="12" cy="12.5" r="2.5" /><path d="M6 12.5h.01M18 12.5h.01" /></Svg>;
  }
}
