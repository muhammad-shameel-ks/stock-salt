"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { User, ClipboardList, Clock, CheckCircle2 } from "lucide-react";

export default function StaffDashboard() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col pb-20">
                    <div className="flex flex-col gap-6 py-6 px-4 md:px-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-1 italic uppercase">STAFF PORTAL</h1>
                            <p className="text-muted-foreground font-medium text-sm">Your daily mission control</p>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-xl font-black italic tracking-tighter uppercase mb-4">Current Shift</h2>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-bold uppercase tracking-widest text-[11px]">8:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="font-bold uppercase tracking-widest text-[11px]">On Duty</span>
                                    </div>
                                </div>
                            </div>
                            <User className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 rotate-12" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card border-2 border-border p-8 rounded-[2rem] flex items-center justify-between group hover:border-emerald-500/40 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <ClipboardList className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest leading-tight">Assigned</p>
                                        <p className="text-2xl font-black italic leading-none">Task Hub</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase opacity-20 group-hover:opacity-100 transition-opacity">Launch →</span>
                            </div>

                            <div className="bg-card border-2 border-border p-8 rounded-[2rem] opacity-50 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest leading-tight">Coming Soon</p>
                                    <p className="text-2xl font-black italic leading-none opacity-40">Time Logs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
