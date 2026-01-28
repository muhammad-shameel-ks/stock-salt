"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Trash2,
    Settings as SettingsIcon,
    Database,
    ShieldAlert,
    Save,
    RefreshCcw,
    Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
    const { user } = useSession();
    const [resetting, setResetting] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            if (!user) return;
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (data) setRole(data.role);
        };
        fetchRole();
    }, [user]);

    const handleResetAllData = async () => {
        setResetting(true);
        try {
            // Correct order: items first due to foreign keys, then headers
            // transaction_items does NOT have org_id, so we use a universal range filter if needed or just .delete() with a dummy where

            // 1. Clear items (No org_id on this table)
            const { error: itemErr } = await supabase.from('transaction_items').delete().filter('quantity', 'gte', 0);
            if (itemErr) throw itemErr;

            // 2. Clear transactions (Has org_id)
            const { error: txErr } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (txErr) throw txErr;

            // 3. Clear daily stocks
            const { error: dsErr } = await supabase.from('daily_stocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (dsErr) throw dsErr;

            // 4. Clear master stocks
            const { error: msErr } = await supabase.from('master_stocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (msErr) throw msErr;

            toast.success("System Reset Successful", {
                description: "All transactions and stock records have been purged."
            });
        } catch (error) {
            console.error("Reset error:", error);
            toast.error("Format Failed", {
                description: "Could not clear all database tables. Check console for details."
            });
        } finally {
            setResetting(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col p-6 gap-8 bg-muted/20">

                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">System Settings</h1>
                        <p className="text-muted-foreground font-medium text-sm mt-2">Manage your command center parameters</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">

                        {/* System Health */}
                        <Card className="rounded-[2.5rem] border-2 bg-card shadow-lg">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-xl font-black italic uppercase tracking-tighter">System Pulse</CardTitle>
                                </div>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Engine Status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                                    <span className="text-sm font-bold uppercase tracking-widest text-emerald-600">Realtime Engine</span>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-black italic">CONNECTED</Badge>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                                    <span className="text-sm font-bold uppercase tracking-widest text-emerald-600">Cloud Postgres</span>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-black italic">OPTIMIZED</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone - Admin Only */}
                        {role === 'admin' && (
                            <Card className="rounded-[2.5rem] border-2 border-destructive/20 bg-destructive/5 shadow-lg relative overflow-hidden group">
                                <CardHeader>
                                    <div className="flex items-center gap-3 text-destructive">
                                        <ShieldAlert className="h-5 w-5" />
                                        <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Danger Zone</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-destructive/60">Destructive Actions</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="font-black text-sm uppercase">Full System Reset</h4>
                                        <p className="text-xs text-muted-foreground font-medium">This will permanently delete all transaction history, stock distribution logs, and master inventory for today. This action is irreversible.</p>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full h-12 rounded-2xl font-black italic tracking-tighter uppercase shadow-lg shadow-destructive/20 group">
                                                <Trash2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                Nuke All Data
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-[2rem] border-2">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="font-black italic text-2xl uppercase tracking-tighter">Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription className="font-medium">
                                                    This action cannot be undone. This will permanently delete your **entire transaction history** and **stock logs** across all outlets.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="gap-2">
                                                <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleResetAllData}
                                                    className="rounded-xl bg-destructive hover:bg-destructive/90 font-black italic uppercase tracking-tighter px-8"
                                                >
                                                    Yes, Purge everything
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                                <Trash2 className="absolute -right-8 -bottom-8 h-32 w-32 text-destructive/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                            </Card>
                        )}
                    </div>

                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
