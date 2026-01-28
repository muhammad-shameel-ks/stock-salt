"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/contexts/session-context";

interface Outlet {
  id: string;
  name: string;
  location: string;
  table_count: number;
}

interface OutletFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  itemToEdit?: Outlet | null;
}

export function OutletForm({ isOpen, onClose, onSuccess, itemToEdit }: OutletFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    tableCount: "10",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSession();

  // Populate form when editing
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || "",
        location: itemToEdit.location || "",
        tableCount: itemToEdit.table_count?.toString() || "10",
      });
    } else {
      setFormData({
        name: "",
        location: "",
        tableCount: "10",
      });
    }
  }, [itemToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profileData?.org_id) {
        throw new Error("Organization not found");
      }

      const outletData = {
        name: formData.name,
        location: formData.location || null,
        table_count: parseInt(formData.tableCount) || 10,
        org_id: profileData.org_id,
      };

      if (itemToEdit) {
        const { error } = await supabase
          .from("outlets")
          .update(outletData)
          .eq("id", itemToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("outlets")
          .insert([outletData]);
        if (error) throw error;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
            {itemToEdit ? "Edit Outlet" : "Register Outlet"}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {itemToEdit ? "Update your branch details." : "Add a new branch to your organization."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-xs font-bold border border-destructive/20 uppercase tracking-wider">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Branch Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Salt Gourmet Downtown"
              className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City / Area"
                className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableCount" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Table Capacity</Label>
              <Input
                id="tableCount"
                name="tableCount"
                type="number"
                min="1"
                value={formData.tableCount}
                onChange={handleChange}
                className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl h-12 px-6 font-bold hover:bg-muted/50 transition-colors"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full h-12 px-8 font-black tracking-tight bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {loading ? "SAVING..." : (itemToEdit ? "UPDATE BRANCH" : "ACTIVATE OUTLET")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
