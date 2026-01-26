"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  LogOut,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

interface AppSidebarProps {
  role?: "admin" | "staff" | "manager";
}

export function AppSidebar({ role = "staff" }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Handle mobile sidebar open/close
  useEffect(() => {
    const overlay = document.getElementById("sidebar-overlay");

    if (isMobile) {
      if (!isCollapsed) {
        // Show sidebar on mobile
        document.body.style.overflow = "hidden"; // Prevent scrolling of main content

        if (overlay) {
          overlay.classList.remove("hidden");
          setTimeout(() => {
            overlay.classList.add("pointer-events-auto", "opacity-100");
          }, 10);
        }
      } else {
        // Hide sidebar on mobile
        document.body.style.overflow = ""; // Re-enable scrolling of main content

        if (overlay) {
          overlay.classList.remove("pointer-events-auto", "opacity-100");
          setTimeout(() => {
            overlay.classList.add("hidden");
          }, 300); // Match transition duration
        }
      }
    }
  }, [isCollapsed, isMobile]);

  // Handle overlay click to close mobile sidebar
  useEffect(() => {
    const overlay = document.getElementById("sidebar-overlay");

    const handleClick = () => {
      if (isMobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    if (overlay) {
      overlay.addEventListener("click", handleClick);
    }

    return () => {
      if (overlay) {
        overlay.removeEventListener("click", handleClick);
      }
    };
  }, [isMobile, isCollapsed]);

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const adminRoutes = [
    {
      href: "/dashboard/admin",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/admin/inventory",
      label: "Inventory",
      icon: Package,
    },
    {
      href: "/dashboard/admin/outlets",
      label: "Outlets",
      icon: Users,
    },
  ];

  const staffRoutes = [
    {
      href: "/dashboard/pos",
      label: "POS Terminal",
      icon: ShoppingCart,
    },
    {
      href: "/dashboard/orders",
      label: "Orders",
      icon: LayoutDashboard,
    },
  ];

  const routes = role === "admin" ? adminRoutes : staffRoutes;

  return (
    <div
      data-sidebar
      className={cn(
        "flex h-screen flex-col border-r bg-card text-card-foreground transition-all duration-300",
        isMobile
          ? isCollapsed
            ? "fixed z-30 w-64 -translate-x-full"
            : "fixed z-30 w-64 translate-x-0"
          : isCollapsed
            ? "w-16"
            : "w-64",
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-xl font-bold tracking-tight text-primary">
            StockSalt
          </h2>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCollapseToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <div className="flex-1 px-2 py-2 overflow-y-auto">
        <nav className="flex flex-col gap-1">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isCollapsed ? "justify-center px-2 py-3" : "justify-start",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{route.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-3">
        <Separator className="my-2" />
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">User</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center",
          )}
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
