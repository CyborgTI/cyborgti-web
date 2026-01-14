import type { ReactNode } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export function DetailShell({
  backHref,
  backLabel,
  children,
}: {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 py-10">
      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-cyborg"
        >
          <FiArrowLeft className="opacity-80" />
          {backLabel}
        </Link>
      </div>

      {children}
    </main>
  );
}
