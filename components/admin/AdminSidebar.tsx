'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Package, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Define the routes for the admin sidebar
const routes = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard/admin' },
    { icon: Store, label: 'Outlets', href: '/dashboard/admin/outlets' },
    { icon: Package, label: 'Inventory', href: '/dashboard/admin/inventory' },
    { icon: FileText, label: 'Reports', href: '/dashboard/admin/reports' },
]

export function AdminSidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div className={cn("w-64 h-screen border-r bg-card text-card-foreground flex flex-col", className)}>
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Admin Panel</h2>
                <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
            </div>
            <div className="flex-1 p-4">
                <nav className="flex flex-col gap-2">
                    {routes.map((route) => {
                        const Icon = route.icon
                        const isActive = pathname === route.href
                        
                        return (
                            <Button
                                key={route.href}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    isActive && "bg-accent text-accent-foreground"
                                )}
                                asChild
                            >
                                <Link href={route.href}>
                                    <Icon className="mr-2 h-4 w-4" />
                                    {route.label}
                                </Link>
                            </Button>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        User Settings
                    </Link>
                </Button>
            </div>
        </div>
    )
}