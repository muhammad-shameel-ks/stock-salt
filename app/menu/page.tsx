"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/contexts/session-context";
import { MenuForm } from "@/components/menu-form";

// Define the menu item interface
interface MenuItem {
  id: string;
  name: string;
  base_price: number;
  is_market_priced: boolean;
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
  const { user } = useSession();

  const fetchMenuItems = async () => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      setLoading(false);
      return;
    }

    if (!user) {
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

      if (profileData?.org_id) {
        // Fetch menu items for the user's organization
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("org_id", profileData.org_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching menu items:", error);
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

  const handleCreateItem = () => {
    setShowCreateModal(true);
  };

  const handleSuccess = () => {
    // Refresh menu items after successful creation
    fetchMenuItems();
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Menu</h1>
                    <p className="text-muted-foreground">
                      Manage your restaurant menu items
                    </p>
                  </div>
                  <Button onClick={handleCreateItem}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p>Loading menu items...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed shadow-sm p-8 mx-4 lg:mx-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">No menu items yet</h3>
                    <p className="text-muted-foreground mt-1">
                      Create your first menu item to get started
                    </p>
                    <Button className="mt-4" onClick={handleCreateItem}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Menu Item
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mx-4 lg:mx-6">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <Badge variant="secondary">
                            {item.is_market_priced ? "Market Priced" : "Fixed"}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {item.category || "Uncategorized"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Price
                            </p>
                            <p className="font-medium">
                              ₹{item.base_price || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Unit
                            </p>
                            <p className="font-medium">
                              {item.unit || "piece"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
      />
    </SidebarProvider>
  );
}
