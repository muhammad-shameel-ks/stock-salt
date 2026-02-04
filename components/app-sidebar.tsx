"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMenu2,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/session-context";
import { supabase } from "@/lib/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Outlets",
      url: "/outlets",
      icon: IconListDetails,
    },
    {
      title: "Menu",
      url: "/menu",
      icon: IconMenu2,
    },
    {
      title: "Stock Management",
      url: "/stocks",
      icon: IconDatabase,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Reports",
      url: "/reports",
      icon: IconReport,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading: authLoading } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("SALT HUB");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        if (!authLoading) setLoading(false);
        return;
      }

      setLoading(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, org_id, organizations(name)")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRole(profile.role);
        // @ts-ignore
        if (profile.organizations?.name) {
          // @ts-ignore
          setOrgName(profile.organizations.name);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, authLoading]);

  const navItems = React.useMemo(() => {
    if (loading) return [];
    if (!role) return [];

    const baseNav = [
      {
        title: "Dashboard",
        url: role === "admin" ? "/dashboard" : (role === "manager" ? "/manager" : "/staff"),
        icon: IconDashboard,
      }
    ];

    if (role === "admin") {
      return [
        ...baseNav,
        { title: "Outlets", url: "/outlets", icon: IconListDetails },
        { title: "Menu", url: "/menu", icon: IconMenu2 },
        { title: "Stock Management", url: "/stocks", icon: IconDatabase },
        { title: "Users", url: "/users", icon: IconUsers },
      ];
    }

    if (role === "manager") {
      return [
        ...baseNav,
        { title: "POS Terminal", url: "/manager/pos", icon: IconMenu2 },
      ];
    }

    return baseNav; // Staff only get Dashboard/Placeholder
  }, [role, loading]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className={cn(
                  "text-base font-black italic tracking-tighter uppercase transition-all duration-500",
                  loading ? "animate-pulse opacity-20" : "opacity-100"
                )}>
                  {loading ? "Loading Terminal" : orgName}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <NavMain items={navItems} />
            {role === "admin" && <NavDocuments items={data.documents} />}
            <NavSecondary items={data.navSecondary} className="mt-auto" />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

import { cn } from "@/lib/utils";

