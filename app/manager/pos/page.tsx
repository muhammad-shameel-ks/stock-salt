"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ChevronRight,
    CreditCard,
    Banknote,
    QrCode,
    X,
    UtensilsCrossed,
    Zap,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    TrendingUp
} from "lucide-react";
import { cn, getLocalTodayString, getStartOfTodayUTC } from "@/lib/utils";
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
} from "@/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";

interface MenuItem {
    id: string;
    name: string;
    name_local: string | null;
    category: string;
    base_price: number;
    image_url: string | null;
    requires_daily_stock: boolean;
}

interface MenuItemWithPrice extends MenuItem {
    price: number;
}

interface CartItem extends MenuItemWithPrice {
    quantity: number;
}

export default function POSPage() {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [menuWithPrices, setMenuWithPrices] = useState<MenuItemWithPrice[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [isSettleOpen, setIsSettleOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [inventory, setInventory] = useState<Record<string, number>>({});
    const [isStockWarningOpen, setIsStockWarningOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [isSettling, setIsSettling] = useState(false);
    const [settlementSuccess, setSettlementSuccess] = useState(false);
    const { user } = useSession();

    const todayLocal = getLocalTodayString();
    const startOfTodayUTC = getStartOfTodayUTC();

    useEffect(() => {
        if (user) {
            fetchMenu();
            fetchInventory();

            // Optimized Realtime Subscription
            const channel = supabase
                .channel('pos-realtime')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'daily_stocks'
                }, (payload) => {
                    // Recalculate inventory from database to account for sales
                    // Can't just add quantity because it ignores today's sales
                    fetchInventory();
                    setIsLocked(false);
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'daily_stocks'
                }, (payload) => {
                    // Recalculate inventory from database to account for sales
                    // Can't just set quantity because it ignores today's sales
                    fetchInventory();
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transaction_items'
                }, (payload) => {
                    const { item_id, quantity } = payload.new;
                    setInventory(prev => ({
                        ...prev,
                        [item_id]: (prev[item_id] || 0) - Number(quantity)
                    }));
                })
                .on('broadcast', { event: 'stock_available' }, (payload) => {
                    // Admin sent stock distribution to this outlet
                    fetchInventory();
                })
                .on('broadcast', { event: 'price_changed' }, (payload) => {
                    // Admin updated price for this item
                    const { item_id, daily_price, item_name } = payload.payload;
                    setMenuWithPrices(prev => {
                        const updated = prev.map(item => {
                            if (item.id === item_id) {
                                return { ...item, price: Number(daily_price) };
                            }
                            return item;
                        });
                        return updated;
                    });
                    toast.success(`Price updated: ${item_name}`, {
                        description: `New price: ₹${daily_price}`,
                        icon: <TrendingUp className="h-4 w-4 text-primary" />,
                        className: "rounded-2xl border-2 border-primary/20"
                    });
                })
                .on('broadcast', { event: 'stock_low' }, (payload) => {
                    // Low stock alert from another terminal
                    const { item_name, quantity } = payload.payload;
                    toast.warning(`Low Stock: ${item_name}`, {
                        description: `Only ${quantity} remaining`,
                        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
                        className: "rounded-2xl border-2 border-amber-500/20"
                    });
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchMenu = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", user.id)
                .single();

            if (profile?.org_id) {
                const [menuRes, masterStocksRes] = await Promise.all([
                    supabase
                        .from("menu_items")
                        .select("*")
                        .eq("org_id", profile.org_id)
                        .order("category"),
                    supabase
                        .from("master_stocks")
                        .select("item_id, daily_price")
                        .eq("org_id", profile.org_id)
                        .eq("stock_date", todayLocal)
                ]);

                if (menuRes.error) throw menuRes.error;
                if (masterStocksRes.error) throw masterStocksRes.error;

                const menuItems = menuRes.data || [];
                const masterStocks = masterStocksRes.data || [];
                const stockPriceMap: Record<string, number> = {};
                
                masterStocks.forEach(ms => {
                    if (ms.daily_price) {
                        stockPriceMap[ms.item_id] = Number(ms.daily_price);
                    }
                });

                const menuWithPrices = menuItems.map(item => ({
                    ...item,
                    price: stockPriceMap[item.id] || item.base_price
                }));

                setMenu(menuItems);
                setMenuWithPrices(menuWithPrices);
            }
        } catch (err: any) {
            toast.error("Failed to load menu");
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        if (!user) return;
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id, outlet_id")
                .eq("id", user.id)
                .single();

            if (!profile) return;

            // 1. Fetch all distributions for today
            const { data: stocks } = await supabase
                .from("daily_stocks")
                .select("item_id, quantity")
                .eq("outlet_id", profile.outlet_id)
                .eq("stock_date", todayLocal);

            // 2. Fetch all sales for today (since local day began)
            const { data: txs } = await supabase
                .from("transactions")
                .select("transaction_items(item_id, quantity)")
                .eq("outlet_id", profile.outlet_id)
                .gte("created_at", startOfTodayUTC);

            const stockMap: Record<string, number> = {};

            // Add distributions
            stocks?.forEach(s => {
                stockMap[s.item_id] = (stockMap[s.item_id] || 0) + Number(s.quantity);
            });

            // Subtract sales
            txs?.forEach(tx => {
                // @ts-ignore
                tx.transaction_items?.forEach((item: any) => {
                    stockMap[item.item_id] = (stockMap[item.item_id] || 0) - Number(item.quantity);
                });
            });

            setInventory(stockMap);

            // Lockdown Logic: Only lock if there are tracked items in the menu 
            // but none are distributed for today.
            const hasStockForToday = stocks && stocks.length > 0;
            setIsLocked(!hasStockForToday);

        } catch (err) {
            console.error("Inv fetch error:", err);
        }
    };

    const categories = useMemo(() => {
        const cats = Array.from(new Set(menu.map(item => item.category)));
        return ["ALL", ...cats];
    }, [menu]);

    const filteredMenu = useMemo(() => {
        return menu.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.name_local?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [menu, searchQuery, selectedCategory]);

    const addToCart = (item: MenuItem) => {
        const menuItemWithPrice = menuWithPrices.find(m => m.id === item.id) || { ...item, price: item.base_price };
        const remaining = inventory[item.id] || 0;
        const currentInCart = cart.find(i => i.id === item.id)?.quantity || 0;

        // Skip stock check for continuous supply items
        if (!item.requires_daily_stock) {
            setCart(prev => {
                const existing = prev.find(i => i.id === item.id);
                if (existing) {
                    return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) as CartItem[];
                }
                return [...prev, { ...menuItemWithPrice, quantity: 1 }];
            });
            return;
        }

        // Strict Enforcement: No bypass
        if (remaining - currentInCart <= 0) {
            toast.error("Item Out of Stock!", {
                icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
                description: "This item must be distributed by Admin before sale.",
                className: "rounded-2xl border-2 font-black italic uppercase text-[10px] tracking-widest"
            });
            return;
        }

        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) as CartItem[];
            }
            return [...prev, { ...menuItemWithPrice, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleSettle = async (method: string) => {
        if (cart.length === 0 || isSettling) return;
        setIsSettling(true);
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id, outlet_id")
                .eq("id", user?.id)
                .single();

            if (!profile) throw new Error("Profile not found");

            // 1. Create Transaction
            const { data: tx, error: txError } = await supabase
                .from("transactions")
                .insert({
                    org_id: profile.org_id,
                    outlet_id: profile.outlet_id,
                    total_amount: cartTotal,
                    payment_method: method,
                    created_by: user?.id
                })
                .select()
                .single();

            if (txError) throw txError;

            // 2. Create Transaction Items
            const txItems = cart.map(item => ({
                transaction_id: tx.id,
                item_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                subtotal: item.price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from("transaction_items")
                .insert(txItems);

            if (itemsError) throw itemsError;

            // Low stock alert broadcast
            const currentInventory = { ...inventory };
            Object.entries(currentInventory).forEach(([itemId, qty]) => {
                const menuItem = menu.find(m => m.id === itemId);
                if (menuItem?.requires_daily_stock && qty > 0 && qty <= 10) {
                    supabase.channel('stock-alerts')
                        .send({
                            type: 'broadcast',
                            event: 'stock_low',
                            payload: {
                                item_id: itemId,
                                item_name: menuItem.name,
                                quantity: qty,
                                outlet_id: profile.outlet_id,
                                timestamp: Date.now()
                            }
                        });
                }
            });

            setSettlementSuccess(true);

            // Auto close after success
            setTimeout(() => {
                setCart([]);
                setIsReviewOpen(false);
                setIsSettleOpen(false);
                setSettlementSuccess(false);
                setIsSettling(false);
                fetchInventory(); // Immediate stock refresh
                toast.success("Transaction Settle Successful!");
            }, 2000);

        } catch (err: any) {
            toast.error(err.message || "Settle failed");
            setIsSettling(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-[#f8f9fa] dark:bg-[#0a0a0a]">
                <SiteHeader />
                <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden pos-container">

                    {/* MENU SECTION */}
                    <div className="flex-1 flex flex-col min-w-0 border-r-2 border-border/50">
                        {/* Search & Categories */}
                        <div className="p-4 space-y-4 bg-background/50 backdrop-blur-xl sticky top-0 z-20 border-b">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search menu items..."
                                    className="pl-11 h-12 rounded-2xl bg-muted/40 border-none shadow-inner font-bold placeholder:text-muted-foreground/40 uppercase tracking-tighter"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar select-none">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap select-none",
                                            selectedCategory === cat
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Items Grid */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar">
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="aspect-[4/5] rounded-[2rem] bg-muted animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredMenu.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                                    <UtensilsCrossed className="h-16 w-16 mb-4" />
                                    <h3 className="font-black italic uppercase italic">No items found</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredMenu.map(item => {
                                        const count = cart.find(i => i.id === item.id)?.quantity || 0;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => addToCart(item)}
                                                className={cn(
                                                    "group relative bg-card rounded-[2rem] border-2 border-transparent p-4 transition-all active:scale-95 cursor-pointer flex flex-col gap-3 overflow-hidden select-none",
                                                    count > 0 ? "border-primary shadow-xl shadow-primary/10" : "hover:border-border hover:shadow-lg",
                                                    (item.requires_daily_stock && (inventory[item.id] || 0) <= 0) && "opacity-60 saturate-50"
                                                )}
                                            >
                                                <div className="aspect-square rounded-2xl bg-muted/50 overflow-hidden relative select-none">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110 pointer-events-none select-none" draggable={false} />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground/20 select-none">
                                                            <Zap className="h-12 w-12" />
                                                        </div>
                                                    )}

                                                    {count > 0 && (
                                                        <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black animate-in zoom-in duration-300 shadow-lg">
                                                            {count}
                                                        </div>
                                                    )}

                                                    {/* Stock Badge */}
                                                    <div className={cn(
                                                        "absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-md border shadow-sm",
                                                        !item.requires_daily_stock
                                                            ? "bg-primary/20 text-primary border-primary/30"
                                                            : (inventory[item.id] || 0) <= 0
                                                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                                                : "bg-black/40 text-white border-white/20"
                                                    )}>
                                                        {!item.requires_daily_stock
                                                            ? "Continuous"
                                                            : (inventory[item.id] || 0) <= 0 ? "Out of Stock" : `${inventory[item.id]} in stock`}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{item.category}</p>
                                                    <h4 className="font-black italic uppercase leading-none truncate text-sm">{item.name}</h4>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="font-black italic text-md">₹{menuWithPrices.find(m => m.id === item.id)?.price || item.base_price}</span>
                                                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                                            <Plus className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESKTOP CART SECTION */}
                    <div className="hidden lg:flex w-[400px] flex-col bg-card border-l-2 border-border/50">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-black italic uppercase leading-none">Checkout</h3>
                                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{cartCount} items selected</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-full h-10 w-10 p-0" onClick={() => setCart([])}>
                                <Trash2 className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-20 italic">
                                    <p className="font-black uppercase tracking-tighter">Your cart is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {cart.map(item => (
                                        <div key={item.id} className="p-4 rounded-3xl bg-muted/30 group transition-all hover:bg-muted/50 border-2 border-transparent">
                                            <div className="flex items-center gap-4 select-none">
                                                <div className="h-12 w-12 rounded-xl bg-muted/80 overflow-hidden shrink-0 select-none">
                                                    {item.image_url && <img src={item.image_url} className="h-full w-full object-cover pointer-events-none select-none" draggable={false} />}
                                                </div>
                                                 <div className="min-w-0 flex-1">
                                                    <h5 className="font-black italic uppercase truncate text-[13px]">{item.name}</h5>
                                                    <p className="font-bold text-xs">₹{item.price}</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/50 rounded-full p-1 border">
                                                    <button onClick={() => removeFromCart(item.id)} className="h-8 w-8 rounded-full hover:bg-white flex items-center justify-center transition-colors">
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="font-black italic w-6 text-center">{item.quantity}</span>
                                                    <button onClick={() => addToCart(item)} className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform active:scale-110">
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-muted/20 border-t space-y-4">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Total Amount</p>
                                <p className="text-4xl font-black italic tracking-tighter tabular-nums">₹{cartTotal}</p>
                            </div>

                            <Sheet open={isSettleOpen} onOpenChange={setIsSettleOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        disabled={cart.length === 0}
                                        className="w-full h-16 rounded-full font-black italic uppercase tracking-widest text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        Settle Bill
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="rounded-t-[3rem] p-8 lg:p-12 border-none h-auto bg-card shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.5)]">
                                    <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8 opacity-40" />
                                    <div className="max-w-screen-md mx-auto space-y-12 pb-12">
                                        <SheetHeader className="text-center p-0">
                                            <SheetTitle className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Final Settlement</SheetTitle>
                                            <SheetDescription className="text-6xl font-black italic tracking-tighter text-foreground block">₹{cartTotal}</SheetDescription>
                                        </SheetHeader>

                                        <div className="relative min-h-[250px] flex items-center justify-center">
                                            {/* Loading State Overlay */}
                                            {isSettling && !settlementSuccess && (
                                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm animate-in fade-in duration-300">
                                                    <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-4">
                                                        <Loader2 className="h-10 w-10 animate-spin" />
                                                    </div>
                                                    <p className="font-black italic uppercase tracking-widest text-xs opacity-60">Processing Payment...</p>
                                                </div>
                                            )}

                                            {/* Success State Overlay */}
                                            {settlementSuccess && (
                                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card animate-in fade-in zoom-in duration-300">
                                                    <div className="h-32 w-32 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 animate-in zoom-in duration-500 delay-150 fill-mode-both">
                                                        <CheckCircle2 className="h-16 w-16" />
                                                    </div>
                                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Payment Complete</h3>
                                                    <p className="font-black italic uppercase tracking-widest text-xs text-emerald-600">Transaction Settled Successfully</p>
                                                </div>
                                            )}

                                            <div className={cn(
                                                "grid grid-cols-3 gap-6 transition-all duration-300",
                                                (isSettling || settlementSuccess) ? "opacity-20 pointer-events-none scale-95 blur-sm" : "opacity-100"
                                            )}>
                                                {[
                                                    { id: 'cash', label: 'Cash', icon: Banknote, color: 'bg-emerald-500' },
                                                    { id: 'card', label: 'Card', icon: CreditCard, color: 'bg-indigo-500' },
                                                    { id: 'upi', label: 'UPI / Scan', icon: QrCode, color: 'bg-primary' }
                                                ].map(method => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => handleSettle(method.id)}
                                                        disabled={isSettling || settlementSuccess}
                                                        className="group flex flex-col items-center gap-4 transition-all select-none"
                                                    >
                                                        <div className={cn(
                                                            "h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] flex items-center justify-center text-white transition-all group-hover:scale-110 active:scale-90 shadow-2xl",
                                                            method.color
                                                        )}>
                                                            <method.icon className="h-10 w-10 md:h-12 md:w-12" />
                                                        </div>
                                                        <span className="font-black italic uppercase tracking-widest text-xs opacity-60 group-hover:opacity-100">{method.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* MOBILE FLOATING CART BUTTON */}
                    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)]">
                        <Sheet open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    className={cn(
                                        "w-full h-16 rounded-full font-black italic uppercase tracking-widest shadow-2xl transition-all flex items-center justify-between px-8",
                                        cart.length > 0 ? "scale-105 opacity-100 shadow-primary/30" : "scale-100 opacity-90 grayscale"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <ShoppingCart className="h-5 w-5" />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-3 -right-3 h-5 w-5 rounded-full bg-white text-primary text-[10px] flex items-center justify-center ring-2 ring-primary">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs">Review Order</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">₹{cartTotal}</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[90vh] rounded-t-[3rem] p-0 overflow-hidden bg-card border-none">
                                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-4 opacity-40" />
                                <div className="flex flex-col h-full">
                                    <SheetHeader className="p-6 border-b flex flex-row items-center justify-between sticky top-0 bg-card z-10 space-y-0">
                                        <SheetTitle className="font-black italic uppercase tracking-widest text-base">Order Review</SheetTitle>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => setCart([])}>
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <SheetDescription className="sr-only">Review your items before checkout</SheetDescription>
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-40">
                                        {cart.map(item => (
                                            <div key={item.id} className="p-4 rounded-3xl bg-muted/40 border">
                                                <div className="flex items-center gap-4 select-none">
                                                    <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden shrink-0 select-none">
                                                        {item.image_url && <img src={item.image_url} className="h-full w-full object-cover pointer-events-none select-none" draggable={false} />}
                                                    </div>
                                                     <div className="flex-1 min-w-0">
                                                        <h5 className="font-black italic uppercase text-sm truncate">{item.name}</h5>
                                                        <p className="font-bold text-xs opacity-60">₹{item.price} / unit</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => removeFromCart(item.id)} className="h-10 w-10 rounded-full border bg-background flex items-center justify-center active:scale-90">
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="font-black italic w-6 text-center">{item.quantity}</span>
                                                        <button onClick={() => addToCart(item)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 shadow-lg">
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-muted/20 border-t space-y-4 absolute bottom-0 left-0 right-0 z-20 backdrop-blur-xl pb-10">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Grand Total</p>
                                            <p className="text-4xl font-black italic tracking-tighter">₹{cartTotal}</p>
                                        </div>
                                        <Button
                                            onClick={() => setIsSettleOpen(true)}
                                            className="w-full h-16 rounded-full font-black italic uppercase tracking-widest text-lg shadow-xl"
                                        >
                                            Checkout Now
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                </div>

                {/* POS Lockdown Overlay */}
                {isLocked && (
                    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
                        <div className="max-w-md w-full bg-card rounded-[3rem] border-2 border-primary/20 p-12 text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="h-24 w-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8 animate-bounce transition-all duration-300">
                                <Zap className="h-12 w-12" />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">POS Locked</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8">Waiting for Today&apos;s Stock to arrive</p>

                            <div className="space-y-4 text-left">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                                    <p className="font-bold text-xs opacity-60 uppercase mb-2">Instructions</p>
                                    <p className="text-[13px] font-medium leading-relaxed">The terminal is suspended until the Admin distributes the master stock for today. Please contact the main hub to confirm shipment arrival.</p>
                                </div>
                                <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 w-fit mx-auto">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Listening for Sync</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
