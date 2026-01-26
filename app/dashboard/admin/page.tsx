import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { DollarSign, Store, AlertTriangle, TrendingUp } from "lucide-react"

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch basic stats (Mocking some for now where detailed aggregations might be complex without SQL functions)
    // 1. Total Sales (Today)
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('is_paid', true)
        .gte('created_at', new Date().toISOString().split('T')[0])

    const todaySales = orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0

    // 2. Active Outlets
    const { count: outletCount } = await supabase
        .from('outlets')
        .select('*', { count: 'exact', head: true })

    // 3. Low Stock Alerts (Global) - Simple check for items < 10
    const { count: lowStockCount } = await supabase
        .from('outlet_inventory')
        .select('*', { count: 'exact', head: true })
        .lt('quantity', 10)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                    <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (Today)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{todaySales.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Outlets</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outletCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Fully operational</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{lowStockCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Items below threshold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Across all outlets</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / Alerts Placeholder */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Freshness Alerts</CardTitle>
                        <p className="text-sm text-muted-foreground">Batches older than 2 days</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Mock Data for visual check - Real implementation in Inventory page */}
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-2 w-2 bg-red-500 rounded-full mr-2" />
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Mathi Batch #204</p>
                                        <p className="text-sm text-muted-foreground">3 days old • Downtown Outlet</p>
                                    </div>
                                    <div className="ml-auto font-medium text-destructive">Dispose</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}