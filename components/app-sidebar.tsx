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
import { supabase } from "@/lib/supabase";
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
      url: "#",
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
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("SALT HUB");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
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
    };
    fetchProfile();
  }, [user]);

  const navItems = React.useMemo(() => {
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
  }, [role]);

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
                <span className="text-base font-black italic tracking-tighter uppercase">{orgName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {role === "admin" && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
