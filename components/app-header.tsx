import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";

type AppHeaderProps = {
  action?: "new-search" | "view-insight";
};

export function AppHeader({ action }: AppHeaderProps) {
  return (
    <header className="border-b border-[#e1e8e3] bg-[var(--paper)]/90 backdrop-blur">
      <div className="shell flex h-[72px] items-center justify-between">
        <Brand />
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-[#788c84] sm:block">GTM intelligence workspace</span>
          {action === "new-search" && (
            <Link href="/" className="button-secondary min-h-10 px-4 text-[13px]">
              New search
            </Link>
          )}
          {action === "view-insight" && (
            <Link
              href="/insights"
              className="button-secondary min-h-10 px-4 text-[13px]"
            >
              Browse insights <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
