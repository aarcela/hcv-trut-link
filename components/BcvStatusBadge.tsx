"use client";

import { useEffect, useState } from "react";

type BcvResponse = {
  currency?: string;
  rate: number;
  updated_at?: string;
  isFallback?: boolean;
};

export default function BcvStatusBadge() {
  const [data, setData] = useState<BcvResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/bcv", { cache: "no-store" });
        const json = (await res.json()) as BcvResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("BCV unavailable");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <span className="text-xs opacity-80">{error}</span>;
  }

  if (!data) {
    return <span className="text-xs opacity-80">Loading rate…</span>;
  }

  return (
    <span
      className={[
        "text-xs font-semibold px-3 py-1 rounded-full border",
        data.isFallback ? "bg-yellow-50 border-yellow-300 text-yellow-900" : "bg-white/10 border-white/20",
      ].join(" ")}
      title={data.updated_at ? `Updated: ${data.updated_at}` : undefined}
    >
      {data.currency ?? "USD"} {data.rate.toFixed(2)}
      {data.isFallback ? " (fallback)" : ""}
    </span>
  );
}
