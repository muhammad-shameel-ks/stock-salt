"use client";

import { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
    Store,
    TrendingUp,
    Package,
    AlertCircle,
    ChevronRight,
    ShoppingCart,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";
import { cn, getLocalTodayString, getStartOfTodayUTC } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface InventoryItem {
    id: string;
    item_id: string;
    quantity: number;
    unit: string;
    created_at: string;
    menu_items: {
        name: string;
        category: string;
    };
}

interface Transaction {
    id: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    status: string;
}

export default function ManagerDashboard() {
    const { user } = useSession();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allDistributions, setAllDistributions] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState<"day" | "week">("day");
    const [selectedItemForHistory, setSelectedItemForHistory] = useState<string | null>(null);

    const todayLocal = getLocalTodayString();
    const startOfTodayUTC = getStartOfTodayUTC();

    useEffect(() => {
        if (user) {
            fetchData();

            // Realtime Sync
            const channel = supabase
                .channel('manager-dash-realtime')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'daily_stocks'
                }, () => fetchData())
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'transactions'
                }, () => fetchData())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, viewType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id, outlet_id")
                .eq("id", user?.id)
                .single();

            if (!profile) return;

            // Fetch Current Inventory Distributions for Today
            const { data: invData } = await supabase
                .from("daily_stocks")
                .select(`
                    id, 
                    item_id, 
                    quantity, 
                    unit,
                    created_at,
                    menu_items (name, category)
                `)
                .eq("outlet_id", profile.outlet_id)
                .eq("stock_date", todayLocal);

            setAllDistributions(invData as any || []);

            // Fetch Recent Transactions
            let query = supabase
                .from("transactions")
                .select("*, transaction_items(*, menu_items(name))")
                .eq("org_id", profile.org_id)
                .eq("outlet_id", profile.outlet_id)
                .order("created_at", { ascending: false });

            if (viewType === "day") {
                query = query.gte("created_at", startOfTodayUTC);
            } else {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                query = query.gte("created_at", weekAgo.toISOString());
            }

            const { data: txData } = await query.limit(10);
            setTransactions(txData || []);

        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const aggregatedInventory = useMemo(() => {
        const map = new Map<string, {
            name: string;
            category: string;
            total: number;
            remaining: number;
            unit: string;
            distributions: InventoryItem[];
        }>();

        allDistributions.forEach(dist => {
            const existing = map.get(dist.item_id);
            if (existing) {
                existing.total += Number(dist.quantity);
                existing.remaining += Number(dist.quantity);
                existing.distributions.push(dist);
            } else {
                map.set(dist.item_id, {
                    name: dist.menu_items?.name || "Unknown",
                    category: dist.menu_items?.category || "General",
                    total: Number(dist.quantity),
                    remaining: Number(dist.quantity),
                    unit: dist.unit,
                    distributions: [dist]
                });
            }
        });

        // Subtract sales (only for today's view)
        transactions.forEach(tx => {
            const txDate = new Date(tx.created_at).toLocaleDateString('en-CA');
            if (txDate === todayLocal) {
                // @ts-ignore
                tx.transaction_items?.forEach((item: { item_id: string; quantity: number | string }) => {
                    const inv = map.get(item.item_id);
                    if (inv) {
                        inv.remaining -= Number(item.quantity);
                    }
                });
            }
        });

        return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
    }, [allDistributions, transactions]);

    const dailyRevenue = transactions.reduce((acc, tx) => acc + tx.total_amount, 0);

    const formatTxDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

        return date.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-[#f8f9fa] dark:bg-[#0a0a0a]">
                <SiteHeader />
                <div className="flex flex-1 flex-col pb-20 overflow-y-auto no-scrollbar">
                    <div className="flex flex-col gap-8 py-8 px-4 md:px-8 w-full">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none mb-2">Operation Control</h1>
                                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-60">Real-time Terminal Intelligence</p>
                            </div>
                            <div className="flex bg-muted/50 p-1 rounded-2xl border">
                                {["day", "week"].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setViewType(t as any)}
                                        className={cn(
                                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            viewType === t ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/40"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Sales</p>
                                    <h2 className="text-5xl font-black italic tracking-tighter">₹{dailyRevenue.toLocaleString()}</h2>
                                    <Button
                                        asChild
                                        className="bg-white text-indigo-600 hover:bg-white/90 rounded-full px-8 font-black italic uppercase tracking-widest shadow-xl active:scale-95 transition-all text-[10px] h-11"
                                    >
                                        <a href="/manager/pos" className="flex items-center gap-2">
                                            Open POS Terminal
                                            <ChevronRight className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                                <ShoppingCart className="absolute -right-8 -top-8 h-48 w-48 text-white/5 -rotate-12 transition-transform group-hover:rotate-0 duration-500" />
                            </div>


                            <div className="bg-card border-2 border-border p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-primary/20 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Clock className="h-7 w-7" />
                                    </div>
                                    <Badge className="rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20 px-4 py-1">
                                        Today
                                    </Badge>
                                </div>
                                <div className="mt-8">
                                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Total Orders</p>
                                    <p className="text-4xl font-black italic leading-none">{transactions.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                            {/* LIVE INVENTORY WIDGET */}
                            <div className="xl:col-span-2 space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Live Outlet Stock</h3>
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest opacity-40">View All</Button>
                                </div>

                                <div className="bg-white dark:bg-card/50 rounded-[2.5rem] border-2 border-border/50 overflow-hidden">
                                    <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                                        {loading ? (
                                            <div className="p-8 space-y-4">
                                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                                            </div>
                                        ) : aggregatedInventory.length === 0 ? (
                                            <div className="p-20 flex flex-col items-center justify-center opacity-40 text-center">
                                                <Package className="h-12 w-12 mb-4" />
                                                <p className="font-black uppercase italic text-sm">No stock distributed yet today</p>
                                            </div>
                                        ) : (
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b-2 border-border/30 bg-muted/20">
                                                        <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Item</th>
                                                        <th className="text-center px-4 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Category</th>
                                                        <th className="text-right px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Remaining</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {aggregatedInventory.map((item) => (
                                                        <Dialog key={item.id}>
                                                            <DialogTrigger asChild>
                                                                <tr className="hover:bg-muted/30 transition-colors group cursor-pointer">
                                                                    <td className="px-8 py-6">
                                                                        <p className="font-black italic uppercase text-lg group-hover:text-primary transition-colors leading-none">{item.name}</p>
                                                                    </td>
                                                                    <td className="px-4 py-6 text-center">
                                                                        <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase px-3 py-0.5 opacity-60">
                                                                            {item.category}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="px-8 py-6 text-right">
                                                                        <div className="inline-flex items-center gap-2">
                                                                            <span className={cn(
                                                                                "text-2xl font-black italic tabular-nums",
                                                                                item.remaining <= 0 ? "text-destructive" : ""
                                                                            )}>{item.remaining}</span>
                                                                            <span className="text-[10px] font-black uppercase opacity-40">{item.unit}</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </DialogTrigger>
                                                            <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-2 bg-card">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Distribution Logs</DialogTitle>
                                                                    <DialogDescription className="font-bold text-xs uppercase tracking-widest opacity-60">{item.name}</DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4 mt-6">
                                                                    <div className="flex justify-between items-end p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
                                                                        <p className="text-[10px] font-black uppercase opacity-40">Total Received Today</p>
                                                                        <p className="text-2xl font-black italic">{item.total} {item.unit}</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <p className="text-[10px] font-black uppercase opacity-40 pl-1">History</p>
                                                                        {item.distributions.map((dist) => (
                                                                            <div key={dist.id} className="flex justify-between items-center p-4 rounded-xl bg-muted/40 border">
                                                                                <div>
                                                                                    <p className="font-black text-sm">+{dist.quantity} {dist.unit}</p>
                                                                                    <p className="text-[9px] opacity-40 uppercase font-bold">
                                                                                        {new Date(dist.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                                    </p>
                                                                                </div>
                                                                                <Badge variant="outline" className="text-[8px] font-black">Logged</Badge>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TRANSACTION HISTORY */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-black italic uppercase italic tracking-tighter">History</h3>
                                    <Badge className="rounded-full px-3 py-0.5 text-[9px]">Live</Badge>
                                </div>
                                <div className="bg-white dark:bg-card/50 rounded-[2.5rem] border-2 border-border/50 p-4 space-y-3">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                                    ) : transactions.length === 0 ? (
                                        <div className="p-12 text-center opacity-30 italic font-black uppercase text-xs">No records</div>
                                    ) : (
                                        transactions.map((tx) => (
                                            <Dialog key={tx.id}>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 transition-all border border-transparent hover:border-border cursor-pointer group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                                <TrendingUp className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black italic uppercase text-sm leading-none mb-1 group-hover:text-primary transition-colors">₹{tx.total_amount}</p>
                                                                <p className="text-[9px] font-black uppercase opacity-40">{tx.payment_method}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-black uppercase opacity-40 mb-1">{formatTxDate(tx.created_at)}</p>
                                                                <p className="text-[10px] font-bold opacity-60">
                                                                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                </p>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-2 bg-card">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Transaction Bill</DialogTitle>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">#{tx.id.slice(0, 8).toUpperCase()}</p>
                                                            <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase px-3 py-0.5 opacity-60">
                                                                {tx.payment_method}
                                                            </Badge>
                                                        </div>
                                                    </DialogHeader>

                                                    <div className="mt-6 space-y-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-black uppercase opacity-40 pl-1">Items Sold</p>
                                                            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                                                                {/* @ts-ignore */}
                                                                {tx.transaction_items?.map((item: any) => (
                                                                    <div key={item.id} className="flex justify-between items-center p-4 rounded-xl bg-muted/40 border">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="font-black text-sm uppercase italic truncate">{item.menu_items?.name}</p>
                                                                            <p className="text-[9px] opacity-40 uppercase font-bold">
                                                                                {item.quantity} x ₹{item.unit_price}
                                                                            </p>
                                                                        </div>
                                                                        <p className="font-black italic text-sm ml-4">₹{item.subtotal}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t-2 border-dashed border-border/50">
                                                            <div className="flex justify-between items-end">
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase opacity-40">Grand Total</p>
                                                                    <p className="text-[8px] font-bold opacity-40 uppercase leading-none">Inclusive of all taxes</p>
                                                                </div>
                                                                <p className="text-4xl font-black italic tracking-tighter">₹{tx.total_amount}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-3 mt-4">
                                                            <div className="flex-1 p-3 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                                                <p className="text-[10px] font-black uppercase opacity-40 mb-1">Date</p>
                                                                <p className="text-xs font-bold">{new Date(tx.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex-1 p-3 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                                                <p className="text-[10px] font-black uppercase opacity-40 mb-1">Time</p>
                                                                <p className="text-xs font-bold">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ))
                                    )}
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="w-full h-12 rounded-2xl font-black uppercase italic text-xs opacity-40 hover:opacity-100 mt-2"
                                    >
                                        <a href="/manager/transactions">View All Activity</a>
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
