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
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/contexts/session-context";

interface OutletFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OutletForm({ isOpen, onClose, onSuccess }: OutletFormProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [tableCount, setTableCount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSession();

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
      // Get user's profile to get org_id
      const { data: profileData } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profileData?.org_id) {
        setError("Organization not found for user");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("outlets").insert([
        {
          name,
          location: location || null,
          table_count: parseInt(tableCount) || 10,
          org_id: profileData.org_id,
        },
      ]);

      if (error) {
        throw error;
      }

      setName("");
      setLocation("");
      setTableCount("10");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Outlet</DialogTitle>
          <DialogDescription>
            Add a new outlet to your organization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="outlet-form">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableCount" className="text-right">
                Table Count
              </Label>
              <Input
                id="tableCount"
                type="number"
                min="1"
                value={tableCount}
                onChange={(e) => setTableCount(e.target.value)}
                className="col-span-3"
                defaultValue="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="outlet-form" disabled={loading}>
              {loading ? "Creating..." : "Create Outlet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
