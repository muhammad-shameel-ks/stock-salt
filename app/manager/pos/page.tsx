"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
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
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
}

interface CartItem extends MenuItem {
    quantity: number;
}

export default function POSPage() {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [isSettleOpen, setIsSettleOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const { user } = useSession();

    useEffect(() => {
        fetchMenu();
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
                const { data, error } = await supabase
                    .from("menu_items")
                    .select("*")
                    .eq("org_id", profile.org_id)
                    .order("category");

                if (error) throw error;
                setMenu(data || []);
            }
        } catch (err: any) {
            toast.error("Failed to load menu");
        } finally {
            setLoading(false);
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
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
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

    const cartTotal = cart.reduce((acc, item) => acc + (item.base_price * item.quantity), 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleSettle = async (method: string) => {
        if (cart.length === 0) return;
        setLoading(true);
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
                unit_price: item.base_price,
                subtotal: item.base_price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from("transaction_items")
                .insert(txItems);

            if (itemsError) throw itemsError;

            toast.success("Transaction Settle Successful!");
            setCart([]);
            setIsReviewOpen(false);
            setIsSettleOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Settle failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-[#f8f9fa] dark:bg-[#0a0a0a]">
                <SiteHeader />
                <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">

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

                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
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
                                                    "group relative bg-card rounded-[2rem] border-2 border-transparent p-4 transition-all active:scale-95 cursor-pointer flex flex-col gap-3",
                                                    count > 0 ? "border-primary shadow-xl shadow-primary/10" : "hover:border-border hover:shadow-lg"
                                                )}
                                            >
                                                <div className="aspect-square rounded-2xl bg-muted/50 overflow-hidden relative">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground/20">
                                                            <Zap className="h-12 w-12" />
                                                        </div>
                                                    )}
                                                    {count > 0 && (
                                                        <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black animate-in zoom-in duration-300">
                                                            {count}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{item.category}</p>
                                                    <h4 className="font-black italic uppercase leading-none truncate text-sm">{item.name}</h4>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="font-black italic text-md">₹{item.base_price}</span>
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
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-muted/80 overflow-hidden shrink-0">
                                                    {item.image_url && <img src={item.image_url} className="h-full w-full object-cover" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="font-black italic uppercase truncate text-[13px]">{item.name}</h5>
                                                    <p className="font-bold text-xs">₹{item.base_price}</p>
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

                                        <div className="grid grid-cols-3 gap-6">
                                            {[
                                                { id: 'cash', label: 'Cash', icon: Banknote, color: 'bg-emerald-500' },
                                                { id: 'card', label: 'Card', icon: CreditCard, color: 'bg-indigo-500' },
                                                { id: 'upi', label: 'UPI / Scan', icon: QrCode, color: 'bg-primary' }
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => handleSettle(method.id)}
                                                    className="group flex flex-col items-center gap-4 transition-all"
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
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden shrink-0">
                                                        {item.image_url && <img src={item.image_url} className="h-full w-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-black italic uppercase text-sm truncate">{item.name}</h5>
                                                        <p className="font-bold text-xs opacity-60">₹{item.base_price} / unit</p>
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
            </SidebarInset>
        </SidebarProvider>
    );
}
