import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--paper)] px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center"><Brand /></div>
        <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--mint-dark)]">404 · Signal lost</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em]">We couldn&apos;t find that page.</h1>
        <p className="mt-4 text-[15px] leading-6 text-[#647970]">Try a new market search and we&apos;ll get the signal back.</p>
        <Link href="/" className="button-primary mt-7"><ArrowLeft size={16} /> Back to search</Link>
      </div>
    </main>
  );
}
