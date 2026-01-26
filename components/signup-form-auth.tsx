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
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      const user = data.user;
      if (!user) {
        throw new Error("User registration failed");
      }

      // Create organization for the user
      if (organizationName.trim()) {
        const { error: orgError } = await supabase
          .from("organizations")
          .insert([{ name: organizationName }]);

        if (orgError) {
          throw orgError;
        }

        // Get the newly created organization to link the user to it
        const { data: orgData, error: fetchOrgError } = await supabase
          .from("organizations")
          .select("id")
          .eq("name", organizationName)
          .single();

        if (fetchOrgError) {
          throw fetchOrgError;
        }

        // Update the user's profile to include the organization ID
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ org_id: orgData.id, role: "admin" })
          .eq("id", user.id);

        if (profileError) {
          throw profileError;
        }
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
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
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

        <div className="relative space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Enlist</h2>
            <p className="text-muted-foreground text-sm font-medium">Create your administrative credentials.</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border-none text-destructive text-xs font-bold animate-in shake duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info Group */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Personal Identifier *</Label>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner font-medium focus-visible:ring-primary/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Digital Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner font-medium focus-visible:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Org Info Group */}
            <div className="space-y-2 p-4 rounded-3xl bg-muted/20 border-2 border-dashed border-muted">
              <Label htmlFor="organization" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Operation / Org Name</Label>
              <Input
                id="organization"
                placeholder="e.g. SALT Global"
                className="h-12 rounded-2xl bg-background border-none shadow-sm font-medium focus-visible:ring-primary/20"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                disabled={loading}
              />
              <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-1 italic">
                Required for administrative oversight.
              </p>
            </div>

            {/* Security Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Secret Key *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner focus-visible:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Verify Key *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner focus-visible:ring-primary/20"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full font-black tracking-tight shadow-xl shadow-primary/20 active:scale-[0.98] transition-all uppercase text-xs bg-primary hover:bg-primary/90 mt-4"
            >
              {loading ? "PROCESSING ENLISTMENT..." : "COMMENCE OPERATION"}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Already enlisted? <a href="/login" className="text-primary font-black uppercase tracking-widest hover:underline">Access Command</a>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center px-4">
        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
          Authorized Personnel Only • Secure 256-bit Encryption
        </p>
      </div>
    </div>
  );
}
