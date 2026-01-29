"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getStartOfTodayUTC } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CalendarIcon,
    PackageIcon,
    ChevronLeft,
    Search,
    CheckCircle2,
    Store,
    ArrowRight,
    TrendingUp,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";
import { format, startOfDay } from "date-fns";
import { StockCounter } from "@/components/stock-counter";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

interface Outlet {
    id: string;
    name: string;
    location: string;
}

interface MenuItem {
    id: string;
    name: string;
    category: string;
    unit: string;
    image_url: string;
    base_price: number;
    is_market_priced: boolean;
    requires_daily_stock: boolean;
}

interface DailyStock {
    id?: string;
    outlet_id: string;
    item_id: string;
    stock_date: string;
    quantity: number;
}

interface MasterStock {
    id?: string;
    item_id: string;
    stock_date: string;
    total_quantity: number;
    daily_price?: number;
    transaction_items: {
        item_id: string;
        quantity: number;
        transactions: {
            outlet_id: string;
        };
    }[];
}

interface TransactionItem {
    item_id: string;
    quantity: number;
    transactions: {
        outlet_id: string;
    };
}

export default function StocksPage() {
    const { user } = useSession();
    const [loading, setLoading] = useState(true);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [distributedStocks, setDistributedStocks] = useState<DailyStock[]>([]);
    const [masterStocks, setMasterStocks] = useState<MasterStock[]>([]);
    const [soldItems, setSoldItems] = useState<TransactionItem[]>([]);

    // UI State
    const [viewMode, setViewMode] = useState<"hub" | "distribution" | "master">("hub");
    const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
    const [stockDate, setStockDate] = useState<Date>(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [saving, setSaving] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Local state for distribution/master editing
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
    const [localPrices, setLocalPrices] = useState<Record<string, number>>({});

    const formattedDate = format(stockDate, "yyyy-MM-dd");

    const fetchData = async () => {
        if (!supabase || !user) return;
        setLoading(true);

        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", user.id)
                .single();

            if (profile?.org_id) {
                const [outletsRes, menuRes, stocksRes, masterRes, soldRes] = await Promise.all([
                    supabase.from("outlets").select("*").eq("org_id", profile.org_id).order("name"),
                    supabase.from("menu_items").select("*").eq("org_id", profile.org_id).order("name"),
                    supabase.from("daily_stocks").select("*").eq("org_id", profile.org_id).eq("stock_date", formattedDate),
                    supabase.from("master_stocks").select("*").eq("org_id", profile.org_id).eq("stock_date", formattedDate),
                    supabase.from("transaction_items").select("item_id, quantity, transactions!inner(outlet_id)").eq("transactions.org_id", profile.org_id).gte("transactions.created_at", getStartOfTodayUTC())
                ]);

                setOutlets(outletsRes.data || []);
                setMenuItems(menuRes.data || []);
                setDistributedStocks(stocksRes.data || []);
                setMasterStocks(masterRes.data || []);
                // @ts-ignore
                setSoldItems(soldRes.data || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Realtime Subscription for Admin Hub
        const channel = supabase
            .channel('admin-stocks-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_stocks' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transaction_items' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'master_stocks' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, formattedDate]);

    // Initialize local quantities based on view mode
    useEffect(() => {
        if (viewMode === "distribution" && selectedOutletId) {
            // In distribution mode, localQuantities manage the "Delta" (Adjustment)
            // so we initialize to 0.
            const initial: Record<string, number> = {};
            menuItems.forEach(item => {
                initial[item.id] = 0;
            });
            setLocalQuantities(initial);
        } else if (viewMode === "master") {
            const initialQty: Record<string, number> = {};
            const initialPrice: Record<string, number> = {};

            masterStocks.forEach(s => {
                initialQty[s.item_id] = Number(s.total_quantity);
                if (s.daily_price) initialPrice[s.item_id] = Number(s.daily_price);
            });

            setLocalQuantities(initialQty);
            setLocalPrices(initialPrice);
        }
    }, [viewMode, selectedOutletId, distributedStocks, masterStocks]);

    const selectedOutlet = useMemo(() =>
        outlets.find(o => o.id === selectedOutletId),
        [selectedOutletId, outlets]
    );

    // Filter items based on view mode
    const filteredItems = useMemo(() => {
        let items = menuItems;

        if (viewMode === "master") {
            // Only show items that require daily stock tracking
            items = menuItems.filter(item => item.requires_daily_stock);
        } else if (viewMode === "distribution") {
            // Show items in master stock PLUS items that don't need tracking
            const masterItemIds = new Set(masterStocks.map(s => s.item_id));
            items = menuItems.filter(item =>
                masterItemIds.has(item.id) || !item.requires_daily_stock
            );
        }

        return items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [menuItems, searchQuery, viewMode, masterStocks]);

    // Calculate remaining availability for tracked items
    const getRemainingStock = (itemId: string) => {
        const item = menuItems.find(m => m.id === itemId);
        if (!item?.requires_daily_stock) return Infinity;

        const masterEntry = masterStocks.find(s => s.item_id === itemId);
        if (!masterEntry) return 0;

        const totalDistributed = distributedStocks
            .filter(s => s.item_id === itemId && s.outlet_id !== selectedOutletId)
            .reduce((sum, s) => sum + Number(s.quantity), 0);

        return Number(masterEntry.total_quantity) - totalDistributed;
    };

    // Live Calculation Logic
    const getLiveMetrics = (itemId: string, outletId: string | null) => {
        const totalDistributed = distributedStocks
            .filter(s => s.item_id === itemId && (outletId ? s.outlet_id === outletId : true))
            .reduce((sum, s) => sum + Number(s.quantity), 0);

        const totalSold = soldItems
            .filter(s => s.item_id === itemId && (outletId ? s.transactions?.outlet_id === outletId : true))
            .reduce((sum, s) => sum + Number(s.quantity), 0);

        return {
            distributed: totalDistributed,
            sold: totalSold,
            live: Math.max(0, totalDistributed - totalSold)
        };
    };

    const globalMetrics = useMemo(() => {
        const totalDistributed = distributedStocks.reduce((sum, s) => sum + Number(s.quantity), 0);
        const totalSold = soldItems.reduce((sum, s) => sum + Number(s.quantity), 0);

        return {
            sent: totalDistributed,
            sold: totalSold,
            live: Math.max(0, totalDistributed - totalSold)
        };
    }, [distributedStocks, soldItems]);

    const detailedBreakdown = useMemo(() => {
        return masterStocks.map(master => {
            const item = menuItems.find(m => m.id === master.item_id);
            const distributions = distributedStocks.filter(s => s.item_id === master.item_id);
            const totalDistributed = distributions.reduce((sum, s) => sum + Number(s.quantity), 0);

            const outletDetails = outlets.map(outlet => {
                const outletDist = distributions.filter(s => s.outlet_id === outlet.id);
                const distributedQty = outletDist.reduce((sum, s) => sum + Number(s.quantity), 0);
                const soldQty = soldItems
                    .filter(s => s.item_id === master.item_id && s.transactions?.outlet_id === outlet.id)
                    .reduce((sum, s) => sum + Number(s.quantity), 0);

                return {
                    outletId: outlet.id,
                    outletName: outlet.name,
                    distributed: distributedQty,
                    sold: soldQty,
                    remaining: Math.max(0, distributedQty - soldQty)
                };
            }).filter(d => d.distributed > 0);

            return {
                itemId: master.item_id,
                itemName: item?.name || "Unknown Item",
                unit: item?.unit || "unit",
                totalMaster: Number(master.total_quantity),
                totalDistributed,
                remainingInMaster: Math.max(0, Number(master.total_quantity) - totalDistributed),
                outletDetails
            };
        });
    }, [masterStocks, menuItems, distributedStocks, soldItems, outlets]);

    const handleUpdateLocal = (itemId: string, value: number) => {
        if (viewMode === "distribution") {
            const item = menuItems.find(m => m.id === itemId);
            if (!item?.requires_daily_stock) {
                setLocalQuantities(prev => ({ ...prev, [itemId]: value }));
                return;
            }

            // Check against Global Master Availability
            const masterEntry = masterStocks.find(s => s.item_id === itemId);
            if (!masterEntry) return;

            const globalDistributed = distributedStocks
                .filter(s => s.item_id === itemId)
                .reduce((sum, s) => sum + Number(s.quantity), 0);

            const currentGlobalTotal = Number(masterEntry.total_quantity);
            const delta = value; // localQuantities is the DELTA in distribution mode

            if (globalDistributed + delta > currentGlobalTotal) {
                toast.error(`Not enough master stock! Max adjustment: ${currentGlobalTotal - globalDistributed}`);
                return;
            }
        }

        setLocalQuantities(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    const handleUpdatePrice = (itemId: string, value: string) => {
        const numValue = parseFloat(value);
        setLocalPrices(prev => ({
            ...prev,
            [itemId]: isNaN(numValue) ? 0 : numValue
        }));
    };

    const handleSaveMaster = async () => {
        if (!user || !supabase) return;
        setSaving(true);

        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", user.id)
                .single();

            if (!profile?.org_id) return;

            const upserts = Object.entries(localQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([itemId, qty]) => ({
                    org_id: profile.org_id,
                    item_id: itemId,
                    stock_date: formattedDate,
                    total_quantity: qty,
                    daily_price: localPrices[itemId] || menuItems.find(m => m.id === itemId)?.base_price || 0,
                    unit: menuItems.find(m => m.id === itemId)?.unit || "unit",
                    created_by: user.id
                }));

            const itemsToDelete = Object.entries(localQuantities)
                .filter(([_, qty]) => qty === 0)
                .map(([itemId, _]) => itemId);

            if (itemsToDelete.length > 0) {
                await supabase
                    .from("master_stocks")
                    .delete()
                    .eq("org_id", profile.org_id)
                    .eq("stock_date", formattedDate)
                    .in("item_id", itemsToDelete);
            }

            const { error } = await supabase
                .from("master_stocks")
                .upsert(upserts, { onConflict: 'org_id,item_id,stock_date' });

            if (error) throw error;

            toast.success("Master stock initialized");
            fetchData();
            setViewMode("hub");
        } catch (error) {
            console.error("Save master error:", error);
            toast.error("Failed to save master stock");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDistribution = async () => {
        if (!user || !selectedOutletId || !supabase) return;
        setSaving(true);

        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", user.id)
                .single();

            if (!profile?.org_id) return;

            // In new logic, we just INSERT the adjustments (deltas)
            const upserts = Object.entries(localQuantities)
                .filter(([_, qty]) => qty !== 0) // Allow negative or positive adjustments
                .map(([itemId, qty]) => ({
                    org_id: profile.org_id,
                    outlet_id: selectedOutletId,
                    item_id: itemId,
                    stock_date: formattedDate,
                    quantity: qty,
                    unit: menuItems.find(m => m.id === itemId)?.unit || "unit",
                    created_by: user.id
                }));

            if (upserts.length === 0) {
                setViewMode("hub");
                return;
            }

            const { error } = await supabase
                .from("daily_stocks")
                .insert(upserts);

            if (error) throw error;

            toast.success("Outlet stock updated");
            fetchData();
            setViewMode("hub");
            setSelectedOutletId(null);
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const getOutletCompletion = (outletId: string) => {
        const items = distributedStocks.filter(s => s.outlet_id === outletId && s.quantity > 0);
        return items.length;
    };

    if (viewMode !== "hub") {
        const isMasterMode = viewMode === "master";
        const title = isMasterMode ? "Setup Daily Master Stock" : selectedOutlet?.name;
        const subtitle = isMasterMode ? "Select items and total quantities for today" : format(stockDate, "MMMM d, yyyy");

        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col pb-24">
                        {/* Action Header */}
                        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={() => { setViewMode("hub"); setSelectedOutletId(null); }} className="rounded-full">
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <div>
                                    <h2 className="text-xl font-bold leading-tight">{title}</h2>
                                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {Object.values(localQuantities).filter(v => v > 0).length} Items
                            </Badge>
                        </div>

                        {/* Search */}
                        <div className="px-4 py-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search items..."
                                    className="pl-10 h-12 rounded-2xl bg-muted/50 border-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 px-4 space-y-3">
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        {isMasterMode ? "No menu items found." : "No master stock found for this date. Set it up first!"}
                                    </p>
                                    {!isMasterMode && (
                                        <Button variant="link" onClick={() => setViewMode("master")} className="mt-2 text-primary font-bold">
                                            Setup Master Stock
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                filteredItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-3xl bg-card border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <PackageIcon className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm truncate">{item.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                    {item.category || "General"} • {item.unit}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="w-[180px]">
                                                {viewMode === "distribution" ? (
                                                    <StockCounter
                                                        value={localQuantities[item.id] || 0}
                                                        onChange={(val) => handleUpdateLocal(item.id, val)}
                                                        unit={item.unit}
                                                        isAdjustment={true}
                                                    />
                                                ) : (
                                                    <StockCounter
                                                        value={localQuantities[item.id] || 0}
                                                        onChange={(val) => handleUpdateLocal(item.id, val)}
                                                        unit={item.unit}
                                                    />
                                                )}
                                            </div>

                                            {/* Info/Price area */}
                                            {viewMode === "distribution" && (
                                                <div className="space-y-1 text-right">
                                                    {item.requires_daily_stock ? (
                                                        <>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[9px] font-black uppercase opacity-40">Today's Price:</span>
                                                                <span className={cn(
                                                                    "text-[10px] font-black italic",
                                                                    masterStocks.find(s => s.item_id === item.id)?.daily_price && masterStocks.find(s => s.item_id === item.id)?.daily_price !== item.base_price
                                                                        ? "text-amber-600"
                                                                        : "text-foreground"
                                                                )}>
                                                                    ₹{masterStocks.find(s => s.item_id === item.id)?.daily_price || item.base_price}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[9px] font-black uppercase opacity-40">Live on Ground:</span>
                                                                <Badge variant="outline" className="text-[10px] font-black bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                                                    {getLiveMetrics(item.id, selectedOutletId).live} {item.unit}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[9px] font-black uppercase opacity-40">Left in Hub:</span>
                                                                <Badge variant="outline" className="text-[10px] font-black bg-primary/5 text-primary border-primary/20">
                                                                    {Math.max(0, (masterStocks.find(s => s.item_id === item.id)?.total_quantity || 0) - distributedStocks.filter(s => s.item_id === item.id).reduce((sum, s) => sum + Number(s.quantity), 0) - (localQuantities[item.id] || 0))} {item.unit}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[9px] font-black uppercase opacity-40">New Balance:</span>
                                                                <span className="text-[10px] font-black italic">
                                                                    {getLiveMetrics(item.id, selectedOutletId).live + (localQuantities[item.id] || 0)} {item.unit}
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="space-y-1 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[9px] font-black uppercase opacity-40">Price:</span>
                                                                <span className="text-[10px] font-black italic">₹{item.base_price}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-primary/20 text-primary bg-primary/5 leading-none h-4 uppercase font-black">Continuous Supply</Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Price Input for Master Mode */}
                                            {isMasterMode && (localQuantities[item.id] > 0) && (
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-black opacity-40">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={localPrices[item.id] ?? item.base_price}
                                                        onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                                                        className={cn(
                                                            "h-8 w-24 rounded-lg bg-muted/50 border-none font-black text-xs text-right focus-visible:ring-primary/20",
                                                            item.is_market_priced ? "text-amber-600" : "text-foreground"
                                                        )}
                                                        placeholder={item.base_price.toString()}
                                                    />
                                                    {item.is_market_priced && (
                                                        <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-amber-500/20 text-amber-600 bg-amber-500/5 leading-none h-4">MARKET</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
                            <div className="max-w-xl mx-auto pointer-events-auto">
                                <Button
                                    className="w-full h-14 rounded-full text-lg font-bold shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                                    onClick={isMasterMode ? handleSaveMaster : handleSaveDistribution}
                                    disabled={saving || (isMasterMode && Object.values(localQuantities).filter(v => v > 0).length === 0)}
                                >
                                    {saving ? "Saving Changes..." : "Confirm & Commit"}
                                    {!saving && <CheckCircle2 className="ml-2 h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    // Distribution Hub (View 1)
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-col gap-6 py-6">
                        {/* Hub Header */}
                        <div className="px-4 md:px-6">
                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight mb-1">Stock Hub</h1>
                                    <p className="text-muted-foreground font-medium text-sm">Daily distribution overview</p>
                                </div>
                                <div className="bg-muted/50 p-1.5 rounded-2xl flex items-center gap-1.5 border">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" className="rounded-xl font-bold h-9 bg-background/50 border shadow-sm">
                                                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                {format(stockDate, "MMM d")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="end">
                                            <Calendar
                                                mode="single"
                                                selected={stockDate}
                                                onSelect={(date) => date && setStockDate(date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl active:rotate-180 transition-transform duration-500"
                                        onClick={() => fetchData()}
                                    >
                                        <TrendingUp className={cn("h-4 w-4", loading && "animate-spin")} />
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Summary Banner */}
                            <div className="mb-8 p-6 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-black italic tracking-tighter">STOCK PROGRESS</h2>
                                        <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-[10px] font-black tracking-widest bg-primary-foreground/10">
                                            {format(stockDate, "EEEE").toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-2 flex-1 bg-primary-foreground/20 rounded-full overflow-hidden border border-primary-foreground/10 shadow-inner">
                                            <div
                                                className="h-full bg-primary-foreground transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                style={{ width: `${(outlets.filter(o => getOutletCompletion(o.id) > 0).length / Math.max(outlets.length, 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-black italic">{Math.round((outlets.filter(o => getOutletCompletion(o.id) > 0).length / Math.max(outlets.length, 1)) * 100)}%</span>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Active</span>
                                            <span className="text-2xl font-black tabular-nums">{outlets.filter(o => getOutletCompletion(o.id) > 0).length} <small className="text-[10px] font-bold opacity-70">Branches</small></span>
                                        </div>
                                        <div className="w-px h-10 bg-primary-foreground/20 rounded-full" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Master</span>
                                            <span className="text-2xl font-black tabular-nums">{masterStocks.length} <small className="text-[10px] font-bold opacity-70">Items</small></span>
                                        </div>
                                    </div>
                                </div>
                                <PackageIcon className="absolute -right-12 -bottom-12 h-48 w-48 text-primary-foreground/10 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
                            </div>

                            {/* Initialization CTA */}
                            {masterStocks.length === 0 ? (
                                <Card className="p-8 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 mb-8 flex flex-col items-center text-center">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <TrendingUp className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-lg font-black italic mb-2">INITIALIZE TODAY'S STOCK</h4>
                                    <p className="text-sm text-muted-foreground mb-6 max-w-xs">Set the master stock items and total quantities before distributing to branches.</p>
                                    <Button
                                        onClick={() => setViewMode("master")}
                                        className="rounded-full px-8 font-black tracking-widest shadow-lg shadow-primary/20"
                                    >
                                        SETUP MASTER STOCK
                                    </Button>
                                </Card>
                            ) : (
                                <div className="flex items-center justify-between mb-8 p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-xs text-emerald-600 uppercase tracking-widest leading-none mb-1">Stock Initialized</p>
                                            <p className="text-[10px] font-bold text-emerald-800/60 uppercase">{masterStocks.length} Items Available</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setViewMode("master")} className="text-emerald-700 font-black text-[10px] tracking-widest uppercase hover:bg-emerald-500/10 rounded-xl">
                                        Update Master
                                    </Button>
                                </div>
                            )}

                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-8 pl-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Global Logistics</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Sync</span>
                                </div>
                            </div>

                            {/* Global Metrics Cards */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                <div className="p-5 rounded-[2rem] bg-card border-2 shadow-sm flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-40">Total Sent</span>
                                    <span className="text-2xl font-black italic tracking-tighter tabular-nums">{globalMetrics.sent}</span>
                                    <div className="h-1 w-8 bg-primary/20 rounded-full mt-1" />
                                </div>
                                <div className="p-5 rounded-[2rem] bg-card border-2 shadow-sm flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-40">Live Sales</span>
                                    <span className="text-2xl font-black italic tracking-tighter tabular-nums text-emerald-600">{globalMetrics.sold}</span>
                                    <div className="h-1 w-8 bg-emerald-500/20 rounded-full mt-1" />
                                </div>
                                <div className="p-5 rounded-[2rem] bg-card border-2 shadow-sm flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-40">On Ground</span>
                                    <span className="text-2xl font-black italic tracking-tighter tabular-nums">{globalMetrics.live}</span>
                                    <div className="h-1 w-8 bg-amber-500/20 rounded-full mt-1" />
                                </div>
                            </div>

                            {/* Detailed Breakdown Toggle */}
                            <div className="flex items-center justify-between mb-6 px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Inventory Breakdown</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl h-8"
                                >
                                    {showDetails ? "Hide Details" : "See Details"}
                                    {showDetails ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                                </Button>
                            </div>

                            {showDetails && (
                                <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {detailedBreakdown.length === 0 ? (
                                        <div className="text-center py-6 bg-muted/30 rounded-3xl border-2 border-dashed">
                                            <p className="text-xs font-bold text-muted-foreground">No stock data available for breakdown</p>
                                        </div>
                                    ) : (
                                        detailedBreakdown.map((item) => (
                                            <Card key={item.itemId} className="p-0 overflow-hidden border-2 bg-card rounded-[2rem] shadow-sm">
                                                <div className="p-5 border-b bg-muted/30">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                                <PackageIcon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm">{item.itemName}</p>
                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.unit}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black uppercase opacity-40 leading-none mb-1">Left in Master</p>
                                                            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-black">
                                                                {item.remainingInMaster} {item.unit}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-background/50 p-3 rounded-2xl border">
                                                            <p className="text-[8px] font-black uppercase opacity-40 mb-1">Total Initial</p>
                                                            <p className="font-black text-sm tabular-nums">{item.totalMaster}</p>
                                                        </div>
                                                        <div className="bg-background/50 p-3 rounded-2xl border">
                                                            <p className="text-[8px] font-black uppercase opacity-40 mb-1">Distributed</p>
                                                            <p className="font-black text-sm tabular-nums">{item.totalDistributed}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.outletDetails.length > 0 && (
                                                    <div className="p-4 bg-muted/5 space-y-2">
                                                        <p className="text-[8px] font-black uppercase tracking-wider opacity-40 px-1 mb-2">Outlet Allocation</p>
                                                        {item.outletDetails.map((outlet) => (
                                                            <div key={outlet.outletId} className="flex items-center justify-between p-3 bg-card border-none rounded-2xl shadow-inner-sm bg-muted/20">
                                                                <div className="flex items-center gap-2">
                                                                    <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    <span className="text-[10px] font-bold">{outlet.outletName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right">
                                                                        <span className="text-[8px] font-black uppercase opacity-40 block leading-none">Sent</span>
                                                                        <span className="text-xs font-black tabular-nums">{outlet.distributed}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-[8px] font-black uppercase opacity-40 block leading-none">Left</span>
                                                                        <span className="text-xs font-black tabular-nums text-emerald-600">{outlet.remaining}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-4 pl-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Outlet Distribution</h3>
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="space-y-10 animate-in fade-in duration-500">
                                        <div className="h-48 rounded-[2.5rem] bg-gradient-to-br from-muted/50 to-muted animate-pulse" />
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-28 rounded-[2rem] bg-muted animate-pulse" />
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map((_, i) => (
                                                <div key={i} className="h-24 rounded-3xl bg-muted animate-pulse" />
                                            ))}
                                        </div>
                                    </div>
                                ) : outlets.length === 0 ? (
                                    <div className="text-center py-12 px-6 rounded-3xl border-2 border-dashed border-muted">
                                        <Store className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                        <p className="font-bold text-muted-foreground">No outlets found</p>
                                    </div>
                                ) : (
                                    outlets.map((outlet) => {
                                        const completion = getOutletCompletion(outlet.id);
                                        const isDone = completion > 0;

                                        return (
                                            <button
                                                key={outlet.id}
                                                onClick={() => {
                                                    setSelectedOutletId(outlet.id);
                                                    setViewMode("distribution");
                                                }}
                                                disabled={masterStocks.length === 0}
                                                className={cn(
                                                    "w-full text-left group relative p-5 rounded-[2rem] transition-all active:scale-[0.98]",
                                                    isDone
                                                        ? "bg-emerald-500/5 border-2 border-emerald-500/20 hover:border-emerald-500/40"
                                                        : "bg-card border-2 border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5",
                                                    masterStocks.length === 0 && "opacity-50 grayscale"
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                                                            isDone ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/5 text-primary group-hover:bg-primary/10"
                                                        )}>
                                                            <Store className="h-7 w-7" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-lg group-hover:text-primary transition-colors">{outlet.name}</p>
                                                            <p className="text-xs font-semibold text-muted-foreground">{outlet.location || "Main Branch"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-right">
                                                        {isDone ? (
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
                                                                    {completion} Items Assigned
                                                                </span>
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full border border-border group-hover:border-primary/40 group-hover:bg-primary/5 flex items-center justify-center transition-all">
                                                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
