import Link from "next/link";
import { Activity } from "lucide-react";

type BrandProps = {
  light?: boolean;
};

export function Brand({ light = false }: BrandProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 no-underline ${light ? "text-white" : "text-[var(--ink)]"}`}
      aria-label="Signalist home"
    >
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? "bg-white/12" : "bg-[var(--ink)] text-white"}`}>
        <Activity size={19} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="text-[19px] font-extrabold tracking-[-0.04em]">Signalist</span>
    </Link>
  );
}
