"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/contexts/session-context";

interface MenuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MenuForm({ isOpen, onClose, onSuccess }: MenuFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    name_local: "",
    base_price: "",
    is_market_priced: false,
    category: "",
    unit: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get user's profile to get org_id
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user?.id!)
        .single();

      if (profileError) throw profileError;

      if (!profileData?.org_id) {
        throw new Error("Organization ID not found for user");
      }

      // Insert new menu item
      const { error: insertError } = await supabase.from("menu_items").insert([
        {
          name: formData.name,
          name_local: formData.name_local || null,
          base_price: parseFloat(formData.base_price) || 0,
          is_market_priced: formData.is_market_priced,
          category: formData.category || null,
          unit: formData.unit || null,
          image_url: formData.image_url || null,
          org_id: profileData.org_id,
        },
      ]);

      if (insertError) throw insertError;

      // Reset form and close modal
      setFormData({
        name: "",
        name_local: "",
        base_price: "",
        is_market_priced: false,
        category: "",
        unit: "",
        image_url: "",
      });

      onSuccess(); // Refresh the menu items list
      onClose();
    } catch (err) {
      console.error("Error creating menu item:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create menu item",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      name_local: "",
      base_price: "",
      is_market_priced: false,
      category: "",
      unit: "",
      image_url: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
          <DialogDescription>
            Fill in the details for the new menu item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Menu item name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_local">Local Name</Label>
            <Input
              id="name_local"
              name="name_local"
              value={formData.name_local}
              onChange={handleChange}
              placeholder="Local language name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_price">Base Price *</Label>
            <Input
              id="base_price"
              name="base_price"
              type="number"
              value={formData.base_price}
              onChange={handleChange}
              required
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fish">Fish</SelectItem>
                <SelectItem value="crab">Crab</SelectItem>
                <SelectItem value="prawn">Prawn</SelectItem>
                <SelectItem value="shellfish">Shellfish</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => handleSelectChange("unit", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="piece">Piece</SelectItem>
                <SelectItem value="plate">Plate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_market_priced"
              name="is_market_priced"
              checked={formData.is_market_priced}
              onCheckedChange={(checked) =>
                handleSelectChange("is_market_priced", checked.toString())
              }
            />
            <Label htmlFor="is_market_priced">Market Priced</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="URL to menu item image"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Menu Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
