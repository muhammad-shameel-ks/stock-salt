"use client";

import { PlusIcon, Store, MapPin, Users, Edit2, Search, MoreVertical, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";
import { OutletForm } from "@/components/outlet-form";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Outlet {
  id: string;
  name: string;
  location: string;
  table_count: number;
  created_at: string;
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Outlet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSession();

  const fetchOutlets = async () => {
    if (!supabase || !user) return;
    setLoading(true);

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profileData?.org_id) {
        const { data, error } = await supabase
          .from("outlets")
          .select("*")
          .eq("org_id", profileData.org_id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOutlets(data || []);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
      toast.error("Failed to load outlets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, [user]);

  const filteredOutlets = useMemo(() => {
    return outlets.filter(o =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.location && o.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [outlets, searchQuery]);

  const handleEdit = (outlet: Outlet) => {
    setItemToEdit(outlet);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setItemToEdit(null);
    setShowForm(true);
  };

  const onSuccess = () => {
    fetchOutlets();
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col pb-20">
          <div className="flex flex-col gap-6 py-6 px-4 md:px-6">

            {/* High Energy Header */}
            <div className="flex items-end justify-between mb-2">
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-1 italic uppercase">OUTLET HUB</h1>
                <p className="text-muted-foreground font-medium text-sm">Managing your empire's presence</p>
              </div>
              <Button
                onClick={handleAddNew}
                className="rounded-2xl h-11 px-6 font-black tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                NEW OUTLET
              </Button>
            </div>

            {/* Salt Premium Progress Banner */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">NETWORK STATUS</h2>
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-[10px] font-black tracking-widest bg-primary-foreground/10 uppercase">
                    Syncing Live
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-2 flex-1 bg-primary-foreground/20 rounded-full overflow-hidden border border-primary-foreground/10 shadow-inner">
                    <div
                      className="h-full bg-primary-foreground transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                      style={{ width: `${Math.min((outlets.length / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-black italic">{outlets.length} / 10</span>
                </div>
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Active Seats</span>
                    <span className="text-2xl font-black tabular-nums tracking-tighter italic">
                      {outlets.reduce((acc, curr) => acc + (curr.table_count || 0), 0)}
                    </span>
                  </div>
                  <div className="w-px h-10 bg-primary-foreground/20 rounded-full" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Growth</span>
                    <span className="text-2xl font-black italic">+12%</span>
                  </div>
                </div>
              </div>
              <Store className="absolute -right-8 -bottom-8 h-48 w-48 text-primary-foreground/10 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find a branch..."
                className="pl-11 h-12 rounded-2xl bg-muted/40 border-none shadow-inner font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Outlets Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 rounded-[2rem] bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredOutlets.length === 0 ? (
              <Card className="p-12 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Store className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-black italic uppercase italic mb-2">NO BRANCHES FOUND</h4>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs font-medium">Start your expansion by registering your first outlet location.</p>
                <Button onClick={handleAddNew} className="rounded-full px-8 font-black tracking-tighter">
                  INITIALIZE FIRST BRANCH
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOutlets.map((outlet) => (
                  <div
                    key={outlet.id}
                    className="group relative bg-card border-2 border-border p-6 rounded-[2rem] transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden shadow-sm ring-4 ring-primary/5">
                          <Store className="h-7 w-7" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xl group-hover:text-primary transition-colors truncate leading-tight uppercase tracking-tighter italic">
                            {outlet.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-muted-foreground/60 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest truncate">
                              {outlet.location || "Earth"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-1.5">
                          <DropdownMenuItem onClick={() => handleEdit(outlet)} className="rounded-xl flex items-center gap-2 font-bold focus:bg-primary focus:text-white cursor-pointer px-4 py-2.5 transition-all">
                            <Edit2 className="h-3.5 w-3.5" />
                            RECONFIGURE
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl flex items-center gap-2 font-bold text-destructive focus:bg-destructive focus:text-white cursor-pointer px-4 py-3 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                            DEACTIVATE
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-dashed border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Capacity</span>
                          <span className="text-xl font-black tabular-nums tracking-tighter italic">
                            {outlet.table_count || 0} <small className="text-[10px] uppercase font-bold opacity-40 italic">Tables</small>
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-xl bg-emerald-500/5 text-emerald-600 border-none font-black text-[9px] tracking-widest px-3 py-1.5 uppercase">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
      <OutletForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={onSuccess}
        itemToEdit={itemToEdit}
      />
    </SidebarProvider>
  );
}
