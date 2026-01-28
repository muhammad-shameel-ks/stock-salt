"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()
  
  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard"
    if (path === "/stocks") return "Stocks"
    if (path === "/users") return "Users"
    if (path === "/settings") return "Settings"
    if (path === "/menu") return "Menu"
    if (path === "/staff") return "Staff"
    if (path === "/outlets") return "Outlets"
    if (path === "/login") return "Login"
    if (path === "/signup") return "Sign Up"
    if (path.startsWith("/manager")) return "Manager"
    if (path === "/") return "Home"
    
    // Fallback: capitalize first letter and replace dashes/hyphens with spaces
    return path
      .split("/")
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase()) || "Documents"
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle(pathname)}</h1>
      </div>
    </header>
  )
}
