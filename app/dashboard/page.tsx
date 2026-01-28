"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  Users,
  CreditCard,
  Store,
  Package,
  Zap,
  ArrowUpRight,
  Clock,
  Wallet,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";
import { getStartOfTodayUTC } from "@/lib/utils";
import { format } from "date-fns";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface Transaction {
  id: string;
  total_amount: number;
  payment_method: string;
  outlet_id: string;
  created_at: string;
  customer_name?: string;
  outlets: {
    name: string;
  };
}

interface Stock {
  quantity: number;
  item_id: string;
}

interface SoldItem {
  quantity: number;
  item_id: string;
}

interface MenuItem {
  id: string;
  name: string;
  unit: string;
  category: string;
}

interface DailyStockEntry {
  item_id: string;
  quantity: number;
}

interface TransactionItem {
  item_id: string;
  quantity: number;
}

export default function ExtremeDashboard() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [distributedStocks, setDistributedStocks] = useState<DailyStockEntry[]>([]);
  const [soldItemEntries, setSoldItemEntries] = useState<TransactionItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const startOfToday = getStartOfTodayUTC();

      const [txRes, stockRes, itemRes, menuRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*, outlets(name)")
          .gte("created_at", startOfToday)
          .order("created_at", { ascending: false }),
        supabase
          .from("daily_stocks")
          .select("item_id, quantity")
          .gte("stock_date", format(new Date(), 'yyyy-MM-dd')),
        supabase
          .from("transaction_items")
          .select("item_id, quantity, transactions!inner(created_at)")
          .gte("transactions.created_at", startOfToday),
        supabase
          .from("menu_items")
          .select("id, name, unit, category")
      ]);

      setTransactions(txRes.data || []);
      setDistributedStocks(stockRes.data || []);
      setSoldItemEntries(itemRes.data || []);
      setMenuItems(menuRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();

      const channel = supabase
        .channel('extreme-dash-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_stocks' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transaction_items' }, () => fetchData())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const metrics = useMemo(() => {
    const globalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.total_amount), 0);
    const upiTotal = transactions.filter(t => t.payment_method === 'UPI').reduce((sum, t) => sum + Number(t.total_amount), 0);
    const cashTotal = transactions.filter(t => t.payment_method === 'Cash').reduce((sum, tx) => sum + Number(tx.total_amount), 0);

    const distributedTotal = distributedStocks.reduce((sum, s) => sum + Number(s.quantity), 0);
    const soldTotal = soldItemEntries.reduce((sum, s) => sum + Number(s.quantity), 0);

    const outletPerformance: Record<string, number> = {};
    transactions.forEach(tx => {
      const name = tx.outlets?.name || "Unknown";
      outletPerformance[name] = (outletPerformance[name] || 0) + Number(tx.total_amount);
    });

    const perItemStats = menuItems.map(item => {
      const sent = distributedStocks
        .filter(s => s.item_id === item.id)
        .reduce((sum, s) => sum + Number(s.quantity), 0);
      const sold = soldItemEntries
        .filter(s => s.item_id === item.id)
        .reduce((sum, s) => sum + Number(s.quantity), 0);

      return {
        ...item,
        sent,
        sold,
        remaining: Math.max(0, sent - sold)
      };
    }).filter(item => item.sent > 0 || item.sold > 0);

    return {
      revenue: globalRevenue,
      txCount: transactions.length,
      aov: transactions.length > 0 ? (globalRevenue / transactions.length) : 0,
      upiTotal,
      cashTotal,
      outletPerformance,
      liveStock: Math.max(0, distributedTotal - soldTotal),
      distributedTotal,
      perItemStats
    };
  }, [transactions, distributedStocks, soldItemEntries, menuItems]);

  const chartData = useMemo(() => {
    // Simple hourly breakdown for today
    const hourly: Record<string, number> = {};
    transactions.forEach(tx => {
      const hour = format(new Date(tx.created_at), 'HH:00');
      hourly[hour] = (hourly[hour] || 0) + Number(tx.total_amount);
    });

    return Object.entries(hourly)
      .map(([time, amount]) => ({ time, amount }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [transactions]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-8 bg-muted/20">

          {/* Real-time Header */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Live Pulse Active</span>
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Command Center</h1>
              <p className="text-muted-foreground font-medium text-sm mt-2">Real-time aggregate analytics across the network</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="h-10 px-4 rounded-2xl bg-background border-2 font-black italic border-primary/20 text-primary">
                {format(new Date(), 'EEEE, MMM do')}
              </Badge>
            </div>
          </div>

          {/* High Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-[2.5rem] border-2 shadow-xl shadow-primary/5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden group">
              <CardHeader className="pb-2">
                <CardDescription className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Global Revenue</CardDescription>
                <CardTitle className="text-4xl font-black italic tracking-tighter tabular-nums">₹{metrics.revenue.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-primary-foreground/80 font-bold text-xs uppercase italic drop-shadow-sm">
                  <TrendingUp className="h-3 w-3" />
                  <span>Real-time Syncing</span>
                </div>
              </CardContent>
              <Zap className="absolute -right-6 -bottom-6 h-32 w-32 text-primary-foreground/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </Card>

            <Card className="rounded-[2.5rem] border-2 bg-card shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-40">Orders Today</CardDescription>
                <CardTitle className="text-4xl font-black italic tracking-tighter tabular-nums">{metrics.txCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 font-bold text-xs uppercase opacity-60">
                  <Clock className="h-3 w-3" />
                  <span>{metrics.aov ? `Avg ₹${metrics.aov.toFixed(0)} / order` : "No sales yet"}</span>
                </div>
              </CardContent>
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Card className="rounded-[2.5rem] border-2 bg-card shadow-lg cursor-pointer hover:border-primary/40 transition-all hover:bg-muted/10 group">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:text-primary transition-colors">Live Stock Items</CardDescription>
                    <CardTitle className="text-4xl font-black italic tracking-tighter tabular-nums">{metrics.liveStock}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-emerald-600">
                      <Package className="h-3 w-3" />
                      <span>{metrics.distributedTotal} Total Distributed</span>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="rounded-[3rem] border-2 max-w-2xl p-0">
                <DialogHeader className="p-8 border-b">
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Inventory Breakdown</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest">On-ground status across all branches</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-8 space-y-4">
                    {metrics.perItemStats.map(item => (
                      <div key={item.id} className="p-4 rounded-3xl bg-muted/40 border-2 border-transparent hover:border-border transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase leading-none mb-1">{item.name}</p>
                            <Badge variant="outline" className="text-[8px] font-black italic opacity-40">{item.category}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-8 items-center text-right">
                          <div>
                            <p className="text-[9px] font-black uppercase opacity-40">Sent</p>
                            <p className="font-bold text-xs">{item.sent} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase opacity-40">Sold</p>
                            <p className="font-bold text-xs text-emerald-600">{item.sold} {item.unit}</p>
                          </div>
                          <div className="min-w-[80px]">
                            <p className="text-[9px] font-black uppercase opacity-40">Live</p>
                            <Badge variant="outline" className="h-8 min-w-[50px] font-black italic text-base border-primary/20 bg-primary/5">
                              {item.remaining}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {metrics.perItemStats.length === 0 && (
                      <div className="py-20 text-center opacity-40 grayscale flex flex-col items-center">
                        <AlertTriangle className="h-12 w-12 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">No stock entries found for today</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Card className="rounded-[2.5rem] border-2 bg-card shadow-lg">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-40">Payment Split</CardDescription>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center bg-muted/30 p-2 rounded-xl border">
                    <span className="text-[9px] font-black uppercase opacity-60">UPI</span>
                    <span className="text-xs font-black italic">₹{metrics.upiTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/30 p-2 rounded-xl border mt-1">
                    <span className="text-[9px] font-black uppercase opacity-60">CASH</span>
                    <span className="text-xs font-black italic">₹{metrics.cashTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Revenue Chart */}
            <Card className="lg:col-span-2 rounded-[3rem] border-2 bg-card shadow-xl overflow-hidden p-2">
              <div className="p-6">
                <h3 className="text-lg font-black italic uppercase tracking-tighter mb-1">Revenue Momentum</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hourly transaction flow for today</p>
              </div>
              <div className="h-[300px] w-full px-4 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      tickMargin={10}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--primary)"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Outlet Performance */}
            <Card className="rounded-[3rem] border-2 bg-card shadow-xl flex flex-col">
              <div className="p-8 pb-4">
                <h3 className="text-lg font-black italic uppercase tracking-tighter">Outlet Rankings</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sales performance by branch</p>
              </div>
              <CardContent className="flex-1 space-y-4 px-8 pb-8">
                {Object.entries(metrics.outletPerformance)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, amount], i) => (
                    <div key={name} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black italic text-primary">
                          #{i + 1}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase leading-none mb-1">{name}</p>
                          <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(amount / metrics.revenue) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black italic text-sm">₹{amount.toLocaleString()}</p>
                        <p className="text-[9px] font-bold opacity-40 uppercase">{((amount / metrics.revenue) * 100).toFixed(0)}% SHARE</p>
                      </div>
                    </div>
                  ))}
                {transactions.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-40 grayscale">
                    <Store className="h-12 w-12 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">No branch activity recorded today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Feed */}
          <Card className="rounded-[3rem] border-2 bg-card shadow-xl overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none mb-1">Live Transaction Stream</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Watching sales as they happen</p>
              </div>
              <Badge variant="outline" className="h-8 rounded-full bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-black italic animate-pulse">
                AGENTIC MODE ON
              </Badge>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {transactions.map(tx => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      {tx.payment_method === 'UPI' ? <Wallet className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase group-hover:text-primary transition-colors">{tx.customer_name || "Quick Sale"}</p>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{tx.outlets?.name} • {format(new Date(tx.created_at), 'hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-black italic text-lg">₹{tx.total_amount}</p>
                      <Badge variant="outline" className="text-[8px] h-4 leading-none font-black px-2 mt-1">{tx.payment_method}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 opacity-40">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-black uppercase text-muted-foreground/60 tracking-widest">Waiting for the first sale of the day...</p>
                </div>
              )}
            </div>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
