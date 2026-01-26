"use client";

import { PlusIcon, Search, LayoutGrid, Package, TrendingUp, MoreVertical, Edit2, Trash2, ChevronLeft } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/contexts/session-context";
import { MenuForm } from "@/components/menu-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define the menu item interface
interface MenuItem {
  id: string;
  name: string;
  base_price: number;
  is_market_priced: boolean;
  requires_daily_stock: boolean;
  created_at: string;
  name_local: string;
  category: string;
  unit: string;
  image_url: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSession();

  const fetchMenuItems = async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profileData?.org_id) {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("org_id", profileData.org_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching menu items:", error);
          toast.error("Failed to load menu");
        } else {
          setMenuItems(data || []);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [menuItems, searchQuery]);

  const handleSuccess = () => {
    fetchMenuItems();
    setItemToEdit(null);
  };

  const handleEditItem = (item: MenuItem) => {
    setItemToEdit(item);
    setShowCreateModal(true);
  };

  const handleAddNew = () => {
    setItemToEdit(null);
    setShowCreateModal(true);
  };


  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category || "Uncategorized"));
    return Array.from(cats);
  }, [menuItems]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col pb-20">
          <div className="flex flex-col gap-6 py-6">
            {/* High Energy Header */}
            <div className="px-4 md:px-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-black tracking-tight mb-1 italic">MENU HUB</h1>
                  <p className="text-muted-foreground font-medium text-sm">Catalogue management</p>
                </div>
                <Button
                  onClick={handleAddNew}
                  className="rounded-2xl h-11 px-6 font-black tracking-tight shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  ADD ITEM
                </Button>
              </div>

              {/* Salt Premium Progress Banner */}
              <div className="mb-8 p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl shadow-violet-500/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black italic tracking-tighter">CATALOGUE STATUS</h2>
                    <Badge variant="outline" className="border-white/30 text-white text-[10px] font-black tracking-widest bg-white/10 uppercase">
                      Active Org
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
                      <div
                        className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                        style={{ width: `${Math.min((menuItems.length / 50) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-black italic">{menuItems.length} / 50</span>
                  </div>
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Total Items</span>
                      <span className="text-3xl font-black tabular-nums">{menuItems.length}</span>
                    </div>
                    <div className="w-px h-10 bg-white/20 rounded-full my-auto" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Categories</span>
                      <span className="text-3xl font-black tabular-nums">{categories.length}</span>
                    </div>
                  </div>
                </div>
                <LayoutGrid className="absolute -right-16 -bottom-16 h-64 w-64 text-white/10 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
              </div>

              {/* Bento Stats & Filters */}
              <div className="flex flex-col gap-4 mb-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-3xl bg-primary/5 flex items-center justify-between border-none shadow-none group active:scale-[0.98] transition-all cursor-default">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Market Priced</p>
                      <p className="text-2xl font-black">{menuItems.filter(i => i.is_market_priced).length}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary/10" />
                  </div>
                  <div className="p-4 rounded-3xl bg-card border-2 border-border flex items-center justify-between group active:scale-[0.98] transition-all cursor-default">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Standard</p>
                      <p className="text-2xl font-black">{menuItems.filter(i => !i.is_market_priced).length}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground/10" />
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dishes or categories..."
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none shadow-inner text-base font-medium focus-visible:ring-primary/20"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between mb-6 pl-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Menu Inventory</h3>
                <div className="h-px flex-1 bg-border mx-4" />
                <Badge variant="outline" className="rounded-lg text-[10px] font-black px-2 py-0 border-primary/20 text-primary">ALL ITEMS</Badge>
              </div>

              {/* Tactile Menu Items Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 rounded-[2rem] bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 px-6 rounded-[2.5rem] border-2 border-dashed border-muted bg-muted/5">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-black italic mb-1 uppercase tracking-tighter">Empty Kitchen</h3>
                  <p className="text-sm text-muted-foreground font-medium mb-6">Start adding your signature dishes to the hub.</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="secondary" className="rounded-full">
                    ADD YOUR FIRST ITEM
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-card border-2 border-border p-5 rounded-[2rem] transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 overflow-hidden shadow-sm">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-7 w-7 opacity-20" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-lg group-hover:text-primary transition-colors truncate leading-tight uppercase tracking-tighter italic">
                              {item.name}
                            </p>
                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                              {item.category || "General"}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl">
                            <DropdownMenuItem
                              onClick={() => handleEditItem(item)}
                              className="rounded-xl flex items-center gap-2 font-bold focus:bg-primary focus:text-white"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex items-center gap-2 font-bold text-destructive focus:bg-destructive focus:text-white">
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-border">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Standard Rate</span>
                          <span className="text-xl font-black tabular-nums tracking-tighter">
                            ₹{item.base_price || 0}
                            <span className="text-[10px] font-bold text-muted-foreground/40 ml-1 italic group-hover:text-primary/40 transition-colors uppercase">
                              / {item.unit || "pc"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-xl border-none font-black text-[9px] tracking-widest px-3 py-1",
                              item.is_market_priced
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-primary/5 text-primary"
                            )}
                          >
                            {item.is_market_priced ? "MARKET" : "FIXED"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-xl border-none font-black text-[9px] tracking-widest px-3 py-1",
                              item.requires_daily_stock
                                ? "bg-indigo-500/10 text-indigo-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            )}
                          >
                            {item.requires_daily_stock ? "DAILY STOCK" : "CONTINUOUS"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
      <MenuForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
        itemToEdit={itemToEdit}
      />
    </SidebarProvider>
  );
}
