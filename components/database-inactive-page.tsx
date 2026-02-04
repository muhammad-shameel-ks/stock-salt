"use client";

import { IconDatabase, IconRefresh, IconClock, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DatabaseInactivePage() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500 max-w-md px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative h-24 w-24 rounded-[2.5rem] bg-card border-2 border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-500/10">
            <IconDatabase className="h-12 w-12 text-amber-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
            Database <span className="text-amber-500">Inactive</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our database is currently waking up. This usually happens on the free tier after a period of inactivity.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="group relative flex items-center justify-center gap-2 h-12 px-6 rounded-[2rem] bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconRefresh className={`h-4 w-4 ${isRetrying ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {isRetrying ? "Connecting..." : "Retry Connection"}
          </button>
          <p className="text-[10px] text-muted-foreground/60">
            Takes approximately 30-60 seconds on first wake-up
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 p-4 rounded-2xl bg-muted/50 border border-muted">
          <IconClock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Free tier databases enter sleep mode after 1 week of inactivity
          </p>
        </div>
      </div>

      <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 h-64 w-64 bg-amber-500/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
    </div>
  );
}
