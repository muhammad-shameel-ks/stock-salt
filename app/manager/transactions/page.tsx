"use client";

import { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
    TrendingUp,
    ChevronLeft,
    ArrowUpDown,
    Filter,
    Search,
    Download,
    Calendar,
    CreditCard,
    Banknote,
    QrCode
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/contexts/session-context";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Transaction {
    id: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    status: string;
}

type SortField = "created_at" | "total_amount";
type SortOrder = "asc" | "desc";

export default function TransactionsPage() {
    const { user } = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [methodFilter, setMethodFilter] = useState("all");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user, sortField, sortOrder, methodFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", user?.id)
                .single();

            if (!profile) return;

            let query = supabase
                .from("transactions")
                .select("*")
                .eq("org_id", profile.org_id)
                .order(sortField, { ascending: sortOrder === "asc" });

            if (methodFilter !== "all") {
                query = query.eq("payment_method", methodFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setTransactions(data || []);

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx =>
            tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.payment_method.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [transactions, searchQuery]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    const formatTxDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': return Banknote;
            case 'card': return CreditCard;
            case 'upi': return QrCode;
            default: return TrendingUp;
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-[#f8f9fa] dark:bg-[#0a0a0a]">
                <SiteHeader />
                <div className="flex flex-1 flex-col pb-20 overflow-y-auto no-scrollbar">
                    <div className="flex flex-col gap-8 py-8 px-4 md:px-8 w-full">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="-ml-4 h-10 px-4 rounded-full font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100"
                                >
                                    <a href="/manager" className="flex items-center gap-2">
                                        <ChevronLeft className="h-4 w-4" />
                                        Back to Command
                                    </a>
                                </Button>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none mb-2">Transaction Archive</h1>
                                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-60">Full history & Audit Logs</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>

                        {/* Filters Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-card/50 p-6 rounded-[2.5rem] border-2 border-border/50 shadow-sm">
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                                <Input
                                    placeholder="Search by ID or Method..."
                                    className="pl-12 h-12 rounded-2xl bg-muted/30 border-none font-bold placeholder:text-muted-foreground/40"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Select value={methodFilter} onValueChange={setMethodFilter}>
                                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none font-bold uppercase text-[10px] tracking-widest px-6 focus:ring-0">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3 w-3 opacity-40" />
                                        <SelectValue placeholder="Payment Method" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    <SelectItem value="all" className="font-bold uppercase text-[10px] tracking-widest">All Methods</SelectItem>
                                    <SelectItem value="cash" className="font-bold uppercase text-[10px] tracking-widest">Cash</SelectItem>
                                    <SelectItem value="card" className="font-bold uppercase text-[10px] tracking-widest">Card</SelectItem>
                                    <SelectItem value="upi" className="font-bold uppercase text-[10px] tracking-widest">UPI / Scan</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="ghost" className="h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 opacity-40 hover:opacity-100">
                                <Calendar className="h-4 w-4" />
                                Custom Range
                            </Button>
                        </div>

                        {/* Archive Table */}
                        <div className="bg-white dark:bg-card/50 rounded-[3rem] border-2 border-border/50 overflow-hidden shadow-2xl shadow-black/5">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-border/30 bg-muted/20">
                                            <th className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Transaction ID</th>
                                            <th
                                                className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 cursor-pointer hover:opacity-100 transition-opacity"
                                                onClick={() => toggleSort("created_at")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Date & Time
                                                    <ArrowUpDown className={cn("h-3 w-3", sortField === "created_at" ? "opacity-100" : "opacity-40")} />
                                                </div>
                                            </th>
                                            <th className="text-center px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Method</th>
                                            <th
                                                className="text-right px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 cursor-pointer hover:opacity-100 transition-opacity"
                                                onClick={() => toggleSort("total_amount")}
                                            >
                                                <div className="flex items-center justify-end gap-2">
                                                    Amount
                                                    <ArrowUpDown className={cn("h-3 w-3", sortField === "total_amount" ? "opacity-100" : "opacity-40")} />
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {loading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <tr key={i}>
                                                    <td colSpan={4} className="p-4"><Skeleton className="h-16 w-full rounded-2xl" /></td>
                                                </tr>
                                            ))
                                        ) : filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-32 text-center">
                                                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                                    <p className="font-black italic uppercase text-sm opacity-20">No records found for this criteria</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((tx) => {
                                                const Icon = getMethodIcon(tx.payment_method);
                                                return (
                                                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                                                        <td className="px-8 py-6">
                                                            <p className="text-[10px] font-mono font-bold opacity-40">#{tx.id.slice(0, 8).toUpperCase()}</p>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="space-y-1">
                                                                <p className="font-black italic uppercase text-sm leading-none">{formatTxDate(tx.created_at)}</p>
                                                                <p className="text-[10px] font-bold opacity-40">
                                                                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border/50">
                                                                <Icon className="h-3 w-3 opacity-60" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{tx.payment_method}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="inline-flex items-center gap-3">
                                                                <p className="text-2xl font-black italic tracking-tighter tabular-nums group-hover:text-primary transition-colors">₹{tx.total_amount.toLocaleString()}</p>
                                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-0.5 rounded-full text-[9px] font-black uppercase">Settled</Badge>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
