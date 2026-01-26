import { useState, useEffect } from "react";
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

interface MenuItem {
  id: string;
  name: string;
  name_local: string;
  base_price: number;
  is_market_priced: boolean;
  requires_daily_stock: boolean;
  category: string;
  unit: string;
  image_url: string;
}

interface MenuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemToEdit?: MenuItem | null;
}

export function MenuForm({ isOpen, onClose, onSuccess, itemToEdit }: MenuFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    name_local: "",
    base_price: "",
    is_market_priced: false,
    requires_daily_stock: true,
    category: "",
    unit: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSession();

  // Effect to populate form when editing
  useState(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || "",
        name_local: itemToEdit.name_local || "",
        base_price: itemToEdit.base_price?.toString() || "",
        is_market_priced: itemToEdit.is_market_priced || false,
        requires_daily_stock: itemToEdit.requires_daily_stock ?? true,
        category: itemToEdit.category || "",
        unit: itemToEdit.unit || "",
        image_url: itemToEdit.image_url || "",
      });
    }
  });

  // Re-populate if itemToEdit changes (e.g. switching between different items)
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || "",
        name_local: itemToEdit.name_local || "",
        base_price: itemToEdit.base_price?.toString() || "",
        is_market_priced: itemToEdit.is_market_priced || false,
        requires_daily_stock: itemToEdit.requires_daily_stock ?? true,
        category: itemToEdit.category || "",
        unit: itemToEdit.unit || "",
        image_url: itemToEdit.image_url || "",
      });
    } else {
      setFormData({
        name: "",
        name_local: "",
        base_price: "",
        is_market_priced: false,
        requires_daily_stock: true,
        category: "",
        unit: "",
        image_url: "",
      });
    }
  }, [itemToEdit, isOpen]);

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
      [name]: name === "is_market_priced" || name === "requires_daily_stock" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("Authentication required");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (!profileData?.org_id) throw new Error("Organization not found");

      const itemData = {
        name: formData.name,
        name_local: formData.name_local || null,
        base_price: parseFloat(formData.base_price) || 0,
        is_market_priced: formData.is_market_priced,
        requires_daily_stock: formData.requires_daily_stock,
        category: formData.category || null,
        unit: formData.unit || null,
        image_url: formData.image_url || null,
        org_id: profileData.org_id,
      };

      if (itemToEdit) {
        // Update existing item
        const { error: updateError } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", itemToEdit.id);

        if (updateError) throw updateError;
      } else {
        // Insert new menu item
        const { error: insertError } = await supabase
          .from("menu_items")
          .insert([itemData]);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving menu item:", err);
      setError(err instanceof Error ? err.message : "Failed to save menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
            {itemToEdit ? "Edit Menu Item" : "Add Menu Item"}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {itemToEdit ? "Update details for this signature dish." : "Fill in the details for the new menu item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-xs font-bold border border-destructive/20 uppercase tracking-wider">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. King Fish Fry"
              className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_local" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Local Name</Label>
              <Input
                id="name_local"
                name="name_local"
                value={formData.name_local}
                onChange={handleChange}
                placeholder="വരാൽ പൊരിച്ചത്"
                className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_price" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Base Price *</Label>
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
                className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="fish">Fish</SelectItem>
                  <SelectItem value="crab">Crab</SelectItem>
                  <SelectItem value="prawn">Prawn</SelectItem>
                  <SelectItem value="shellfish">Shellfish</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleSelectChange("unit", value)}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="plate">Plate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-[1.5rem] border-2 border-dashed border-border/50">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="is_market_priced"
                name="is_market_priced"
                checked={formData.is_market_priced}
                onCheckedChange={(checked) =>
                  handleSelectChange("is_market_priced", checked ? "true" : "false")
                }
                className="h-5 w-5 rounded-lg border-2 border-primary/20 data-[state=checked]:bg-primary"
              />
              <Label htmlFor="is_market_priced" className="text-[10px] font-black uppercase tracking-widest leading-none cursor-pointer">Market Priced</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="requires_daily_stock"
                name="requires_daily_stock"
                checked={formData.requires_daily_stock}
                onCheckedChange={(checked) =>
                  handleSelectChange("requires_daily_stock", checked ? "true" : "false")
                }
                className="h-5 w-5 rounded-lg border-2 border-primary/20 data-[state=checked]:bg-primary"
              />
              <Label htmlFor="requires_daily_stock" className="text-[10px] font-black uppercase tracking-widest leading-none cursor-pointer">Track Stock</Label>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="image_url" className="text-[10px] font-black uppercase opacity-60 tracking-widest pl-1">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://..."
              className="h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="rounded-xl h-12 px-6 font-bold hover:bg-muted/50 transition-colors"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full h-12 px-8 font-black tracking-tight bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {loading ? "SAVING..." : (itemToEdit ? "UPDATE ITEM" : "ADD TO MENU")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
