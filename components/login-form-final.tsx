"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Redirect to dashboard or home page after successful login
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="p-8 rounded-[2rem] bg-card border-2 border-border shadow-2xl shadow-black/5 relative overflow-hidden">
        {/* Visual Accent */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

        <div className="relative space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Login</h2>
            <p className="text-muted-foreground text-sm font-medium">Access your organizational hub.</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border-none text-destructive text-xs font-bold animate-in shake duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Email Connection *</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@salt.internal"
                className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner font-medium focus-visible:ring-primary/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <Label htmlFor="password" className="text-[10px] font-black uppercase opacity-40 tracking-widest">Security Key *</Label>
                <a href="#" className="text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity tracking-widest">Forgot?</a>
              </div>
              <Input
                id="password"
                type="password"
                className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner focus-visible:ring-primary/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full font-black tracking-tight shadow-lg shadow-primary/20 active:scale-[0.98] transition-all uppercase text-[11px]"
            >
              {loading ? "AUTHENTICATING..." : "BREACH HUB"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase bg-card px-2 text-muted-foreground tracking-[0.2em] opacity-40">
                OR
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 rounded-full font-bold border-2 border-muted hover:bg-muted/50 active:scale-[0.98] transition-all text-xs"
            >
              {loading ? "INITIALIZING..." : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                  Continue with Google
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Don't have access? <a href="/signup" className="text-primary font-black uppercase tracking-widest hover:underline">Request Enlistment</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
