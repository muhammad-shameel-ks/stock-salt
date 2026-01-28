"use client";

import { PlusIcon, Users as UsersIcon, Shield, Store, UserCircle, Edit2, Trash2, Search, MoreVertical, Key, Lock, Eye, EyeOff, CheckCircle2, RotateCcw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";
import { UserForm } from "@/components/user-form";
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

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    outlet_id: string | null;
    login_id: string | null;
    plain_password: string | null;
    outlets?: { name: string };
}

function CredentialRevealer({ value }: { value: string | null }) {
    const [revealed, setRevealed] = useState(false);

    if (!value) return (
        <div>
            <p className="text-[9px] font-black uppercase opacity-40 leading-none">Password</p>
            <p className="text-[11px] font-bold tracking-tight opacity-20 italic">UNSET</p>
        </div>
    );

    return (
        <div className="flex items-center gap-3">
            <div>
                <p className="text-[9px] font-black uppercase opacity-40 leading-none">Password</p>
                <p className="text-[11px] font-bold tracking-tight font-mono">
                    {revealed ? value : "••••••••"}
                </p>
            </div>
            <button
                onClick={() => setRevealed(!revealed)}
                className="hover:text-primary transition-colors mt-1"
            >
                {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
        </div>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [userToEdit, setUserToEdit] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { user: currentUser, session } = useSession();

    const fetchUsers = async () => {
        if (!supabase || !currentUser) return;
        setLoading(true);

        try {
            const { data: profileData } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", currentUser.id)
                .single();

            if (profileData?.org_id) {
                // Fetch all users in the same org
                // Note: profiles table contains the role/name info
                // We might want to join with auth.users if we needed email, 
                // but our handle_new_user trigger stores everything we need in profiles
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*, outlets(name)")
                    .eq("org_id", profileData.org_id)
                    .order("full_name");

                if (error) throw error;
                setUsers(data || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser]);

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const handleEdit = (user: UserProfile) => {
        setUserToEdit(user);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setUserToEdit(null);
        setShowForm(true);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to deactivate this operative? Access will be revoked immediately.")) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: "inactive" })
                .eq("id", userId);

            if (error) throw error;

            toast.success("Operative deactivated");
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to deactivate user");
        }
    };

    const handlePurge = async (userId: string) => {
        if (!confirm("DANGER: This will permanently remove this operative's profile from your organization records. This cannot be undone. Proceed?")) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("id", userId);

            if (error) throw error;

            toast.success("Operative purged from records");
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to purge user");
        }
    };

    const handleReactivate = async (userId: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: "staff" }) // Default back to staff on reactivation
                .eq("id", userId);

            if (error) throw error;

            toast.success("Operative reactivated");
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to reactivate user");
        }
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
                                <h1 className="text-3xl font-black tracking-tight mb-1 italic uppercase">USER HUB</h1>
                                <p className="text-muted-foreground font-medium text-sm">Managing your organizational operatives</p>
                            </div>
                            <Button
                                onClick={handleAddNew}
                                className="rounded-2xl h-11 px-6 font-black tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                ENLIST OPERATIVE
                            </Button>
                        </div>

                        {/* Network Overview Banner */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase">ACCESS LEVEL</h2>
                                    <Badge variant="outline" className="border-white/30 text-white text-[10px] font-black tracking-widest bg-white/10 uppercase">
                                        Admin Privileges
                                    </Badge>
                                </div>
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Total Operatives</span>
                                        <span className="text-3xl font-black tabular-nums tracking-tighter italic">
                                            {users.length}
                                        </span>
                                    </div>
                                    <div className="w-px h-10 bg-white/20 rounded-full" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">Outlet Managers</span>
                                        <span className="text-3xl font-black italic">
                                            {users.filter(u => u.role === 'outlet_manager').length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Shield className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
                        </div>

                        {/* Search */}
                        <div className="relative mb-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Find an operative by name or role..."
                                className="pl-11 h-12 rounded-2xl bg-muted/40 border-none shadow-inner font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Users List */}
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 rounded-3xl bg-muted animate-pulse" />
                                ))}
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <Card className="p-12 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center text-center">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <h4 className="text-lg font-black italic uppercase mb-2">NO OPERATIVES FOUND</h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-xs font-medium">Add managers and staff to distribute responsibilities.</p>
                                <Button onClick={handleAddNew} className="rounded-full px-8 font-black tracking-tighter">
                                    ENLIST FIRST MEMBER
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className={cn(
                                            "group relative bg-card border-2 border-border rounded-3xl transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.99] animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center justify-between p-4 overflow-hidden",
                                            u.role === 'inactive' && "opacity-60 grayscale-[0.5] border-destructive/20"
                                        )}
                                    >
                                        {/* Deactivated Banner */}
                                        {u.role === 'inactive' && (
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
                                        )}

                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                                u.role === 'admin' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                {u.role === 'admin' ? <Shield className="h-6 w-6" /> : <UserCircle className="h-6 w-6" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-sm group-hover:text-primary transition-colors truncate uppercase tracking-tight italic">
                                                        {u.full_name}
                                                    </p>
                                                    <Badge variant="outline" className={cn(
                                                        "rounded-lg border-none font-black text-[10px] tracking-[0.10em] px-2 py-0.5 uppercase",
                                                        u.role === 'admin' ? "bg-primary/10 text-primary" : (u.role === 'manager' ? "bg-indigo-500/10 text-indigo-600" : (u.role === 'inactive' ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"))
                                                    )}>
                                                        {u.role === 'inactive' ? 'DEACTIVATED' : u.role.replace('_', ' ')}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2">
                                                    {/* Login ID Section */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                                                            <Key className="h-3 w-3" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase opacity-40 leading-none">ID</p>
                                                            <p className="text-[11px] font-bold tracking-tight">{u.login_id || '---'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Password Section */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                                                            <Lock className="h-3 w-3" />
                                                        </div>
                                                        <CredentialRevealer value={u.plain_password} />
                                                    </div>

                                                    {/* Outlet Section */}
                                                    {u.outlets?.name && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                                                                <Store className="h-3 w-3" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase opacity-40 leading-none">Branch</p>
                                                                <p className="text-[11px] font-bold tracking-tight uppercase">{u.outlets.name}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {u.id !== currentUser.id && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-1.5 min-w-[160px]">
                                                        <DropdownMenuItem onClick={() => handleEdit(u)} className="rounded-xl flex items-center gap-2 font-bold focus:bg-primary focus:text-white cursor-pointer px-4 py-2.5 transition-all uppercase text-[10px] tracking-widest">
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                            Modify
                                                        </DropdownMenuItem>

                                                        {u.role === 'inactive' ? (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleReactivate(u.id)} className="rounded-xl flex items-center gap-2 font-bold text-emerald-600 focus:bg-emerald-600 focus:text-white cursor-pointer px-4 py-2.5 transition-all uppercase text-[10px] tracking-widest">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Reactivate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handlePurge(u.id)} className="rounded-xl flex items-center gap-2 font-black text-destructive focus:bg-destructive focus:text-white cursor-pointer px-4 py-3 transition-all uppercase text-[10px] tracking-widest bg-destructive/5 mt-1">
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Purge Record
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => handleDelete(u.id)} className="rounded-xl flex items-center gap-2 font-bold text-destructive focus:bg-destructive focus:text-white cursor-pointer px-4 py-3 transition-all uppercase text-[10px] tracking-widest mt-1">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Deactivate
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            {u.id === currentUser.id && (
                                                <Badge variant="secondary" className="rounded-lg text-[8px] tracking-widest opacity-40 uppercase">You</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
            <UserForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSuccess={fetchUsers}
                userToEdit={userToEdit}
            />
        </SidebarProvider>
    );
}
