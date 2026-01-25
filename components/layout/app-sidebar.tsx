'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface AppSidebarProps {
    role?: 'admin' | 'staff' | 'manager'
}

export function AppSidebar({ role = 'staff' }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const adminRoutes = [
        {
            href: '/dashboard/admin',
            label: 'Overview',
            icon: LayoutDashboard,
        },
        {
            href: '/dashboard/admin/inventory',
            label: 'Inventory',
            icon: Package,
        },
        {
            href: '/dashboard/admin/outlets',
            label: 'Outlets',
            icon: Users,
        },
    ]

    const staffRoutes = [
        {
            href: '/dashboard/pos',
            label: 'POS Terminal',
            icon: ShoppingCart,
        },
        {
            href: '/dashboard/orders',
            label: 'Orders',
            icon: LayoutDashboard,
        },
    ]

    const routes = role === 'admin' ? adminRoutes : staffRoutes

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight text-primary">StockSalt</h2>
            </div>
            <div className="flex-1 px-4 py-2">
                <nav className="flex flex-col gap-2">
                    {routes.map((route) => {
                        const Icon = route.icon
                        const isActive = pathname === route.href
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {route.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4">
                <Separator className="my-4" />
                <div className="flex items-center gap-3 px-2 mb-4">
                    <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                        <p className="font-medium">User</p>
                        <p className="text-xs text-muted-foreground capitalize">{role}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
