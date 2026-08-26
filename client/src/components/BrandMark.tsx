import type { SVGProps } from "react";

/** A self-contained Lifewoven mark that does not depend on external asset delivery. */
export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Lifewoven"
      className={className}
      {...props}
    >
      <rect width="48" height="48" rx="12" fill="#1d1c1a" />
      <path d="M13 15h22M13 24h22M13 33h22" stroke="#e0bd65" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 11v26M24 11v26M30 11v26" stroke="#f4df9d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="24" r="4" fill="#e0bd65" />
    </svg>
  );
}
