"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/session-context";
import { supabase } from "@/lib/supabase";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

interface Outlet {
    id: string;
    name: string;
}

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userToEdit?: any | null;
}

// Initialize a secondary client for user creation to avoid logging out the admin
const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                // Using a unique storage key prevents the "Multiple GoTrueClient instances" warning
                storageKey: 'salt-admin-temp-storage'
            },
        }
    );
};

export function UserForm({ isOpen, onClose, onSuccess, userToEdit }: UserFormProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        loginId: "",
        password: "",
        role: "staff",
        outletId: "none",
    });
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [loading, setLoading] = useState(false);
    const { user: currentUser } = useSession();

    useEffect(() => {
        const fetchOutlets = async () => {
            const { data: profile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", currentUser?.id)
                .single();

            if (profile?.org_id) {
                const { data } = await supabase
                    .from("outlets")
                    .select("id, name")
                    .eq("org_id", profile.org_id)
                    .order("name");
                setOutlets(data || []);
            }
        };

        if (isOpen) {
            fetchOutlets();
            if (userToEdit) {
                setFormData({
                    fullName: userToEdit.full_name || "",
                    loginId: userToEdit.email?.split("@")[0] || "",
                    password: "", // Don't show password
                    role: userToEdit.role || "staff",
                    outletId: userToEdit.outlet_id || "none",
                });
            } else {
                setFormData({
                    fullName: "",
                    loginId: "",
                    password: "",
                    role: "staff",
                    outletId: "none",
                });
            }
        }
    }, [isOpen, userToEdit, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const email = `${formData.loginId}@salt.internal`;

            const { data: adminProfile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", currentUser?.id)
                .single();

            if (!adminProfile) throw new Error("Org Admin not identified");

            if (userToEdit) {
                // Update Phase: Only update the profile table
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        full_name: formData.fullName,
                        role: formData.role,
                        outlet_id: formData.outletId === "none" ? null : formData.outletId,
                        plain_password: formData.password || undefined // Update if provided
                    })
                    .eq("id", userToEdit.id);

                if (error) throw error;
                toast.success("Profile updated successfully");
            } else {
                // Create Phase: Use client-side signUp
                const tempClient = createAdminClient();
                const { error: signUpError } = await tempClient.auth.signUp({
                    email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                            role: formData.role,
                            org_id: adminProfile.org_id,
                            outlet_id: formData.outletId === "none" ? null : formData.outletId,
                            login_id: formData.loginId,
                            plain_password: formData.password
                        },
                    },
                });

                if (signUpError) {
                    // Check if user already exists in Auth but is missing profile (Ghost User)
                    if (signUpError.message?.toLowerCase().includes("already registered")) {
                        const { error: relinkError } = await supabase.rpc('relink_user_profile', {
                            p_email: email,
                            p_full_name: formData.fullName,
                            p_role: formData.role,
                            p_org_id: adminProfile.org_id,
                            p_outlet_id: formData.outletId === "none" ? null : formData.outletId,
                            p_login_id: formData.loginId,
                            p_plain_password: formData.password
                        });

                        if (relinkError) throw relinkError;
                        toast.success("Existing operative's record recovered and re-enlisted!");
                    } else {
                        throw signUpError;
                    }
                } else {
                    toast.success("Operative registered! They can now log in.");
                }
            }

            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error("User management error:", error);
            toast.error(error.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                        {userToEdit ? "Modify Member" : "Enlist Member"}
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                        {userToEdit ? "Update credential and permissions." : "Add a new operative to your organization."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Full Name *</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="loginId" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Login ID *</Label>
                            <div className="relative">
                                <Input
                                    id="loginId"
                                    name="loginId"
                                    value={formData.loginId}
                                    onChange={handleChange}
                                    placeholder="staff1"
                                    className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner pr-24"
                                    required
                                    disabled={!!userToEdit}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">@salt.internal</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">
                                {userToEdit ? "New Password (Optional)" : "Password *"}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
                                required={!userToEdit}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Position / Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                            >
                                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner font-bold uppercase text-[11px] tracking-wider">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="staff" className="font-bold uppercase text-[10px] tracking-widest">Store Staff</SelectItem>
                                    <SelectItem value="manager" className="font-bold uppercase text-[10px] tracking-widest">Outlet Manager</SelectItem>
                                    <SelectItem value="admin" className="font-bold uppercase text-[10px] tracking-widest">Org Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Assign to Outlet</Label>
                            <Select
                                value={formData.outletId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, outletId: val }))}
                            >
                                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner font-bold uppercase text-[11px] tracking-wider">
                                    <SelectValue placeholder="All Outlets" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="none" className="font-bold uppercase text-[10px] tracking-widest italic opacity-60">Global / None</SelectItem>
                                    {outlets.map(o => (
                                        <SelectItem key={o.id} value={o.id} className="font-bold uppercase text-[10px] tracking-widest">
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl h-12 px-6 font-bold hover:bg-muted/50 transition-colors uppercase text-[11px] tracking-widest"
                        >
                            STAND BY
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-full h-12 px-8 font-black tracking-tight bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase text-[11px]"
                        >
                            {loading ? "PROCESSING..." : (userToEdit ? "CONFIRM CHANGES" : "DEPLOY OPERATIVE")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
