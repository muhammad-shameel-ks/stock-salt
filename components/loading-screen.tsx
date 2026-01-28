"use client";

import { IconInnerShadowTop } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function LoadingScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + (100 - prev) * 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
            <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
                {/* Pulsing Logo */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative h-20 w-20 rounded-[2rem] bg-card border-2 border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                        <IconInnerShadowTop className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                </div>

                {/* Brand Text */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        SALT<span className="text-primary italic">.</span>HUB
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">
                        Synchronizing Terminal
                    </p>
                </div>

                {/* Progress Bar Container */}
                <div className="w-48 h-1 bg-muted rounded-full overflow-hidden relative">
                    <div
                        className="absolute inset-y-0 left-0 bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 h-64 w-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
        </div>
    );
}
