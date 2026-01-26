"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Store, TrendingUp, Package, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ManagerDashboard() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col pb-20">
                    <div className="flex flex-col gap-6 py-6 px-4 md:px-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-1 italic uppercase">MANAGER TERMINAL</h1>
                            <p className="text-muted-foreground font-medium text-sm">Outlet operations control</p>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-xl font-black italic tracking-tighter uppercase mb-4">Daily Focus</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                        <p className="text-[10px] font-black uppercase opacity-60 mb-1">Stock Readiness</p>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-400" />
                                            <span className="font-bold">Check morning distribution</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                        <p className="text-[10px] font-black uppercase opacity-60 mb-1">Active Staff</p>
                                        <span className="text-2xl font-black italic">4 On Duty</span>
                                    </div>
                                </div>
                            </div>
                            <Store className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 rotate-12" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Inventory", icon: Package, count: "128 Items" },
                                { title: "Revenue", icon: TrendingUp, count: "₹45,200" },
                                { title: "Status", icon: Store, count: "Operational" }
                            ].map((card, i) => (
                                <div key={i} className="bg-card border-2 border-border p-6 rounded-[2rem] hover:border-primary/40 transition-all">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <card.icon className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">{card.title}</p>
                                    <p className="text-2xl font-black italic leading-none">{card.count}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 border-2 border-dashed border-border rounded-[2rem] p-12 flex flex-col items-center justify-center text-center">
                            <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="text-muted-foreground" />
                            </div>
                            <h3 className="font-black italic uppercase italic">Extended Terminal Features</h3>
                            <p className="text-sm text-muted-foreground font-medium max-w-xs mt-2">Specialized manager tools for live inventory and sales reporting are coming soon.</p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
