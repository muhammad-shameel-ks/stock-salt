"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/contexts/session-context";
import { 
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RePieChart, 
  ResponsiveContainer, Tooltip, XAxis, YAxis 
} from "recharts";
import { 
  ArrowDownRight, ArrowUpRight, Calendar, Download, Filter, LayoutDashboard, 
  Receipt, Wallet, Activity, CreditCard
} from "lucide-react";
import { useState } from "react";

// Mock Data
const revenueData = [
  { time: "08:00", revenue: 1200, orders: 15 },
  { time: "09:00", revenue: 2100, orders: 28 },
  { time: "10:00", revenue: 1800, orders: 22 },
  { time: "11:00", revenue: 3200, orders: 42 },
  { time: "12:00", revenue: 4500, orders: 58 },
  { time: "13:00", revenue: 5200, orders: 65 },
  { time: "14:00", revenue: 3800, orders: 48 },
  { time: "15:00", revenue: 2900, orders: 36 },
  { time: "16:00", revenue: 3400, orders: 42 },
  { time: "17:00", revenue: 4100, orders: 52 },
  { time: "18:00", revenue: 5600, orders: 72 },
  { time: "19:00", revenue: 6800, orders: 88 },
  { time: "20:00", revenue: 5200, orders: 68 },
  { time: "21:00", revenue: 3200, orders: 42 },
];

const categoryData = [
  { name: "Beverages", value: 35, color: "hsl(var(--primary))" },
  { name: "Snacks", value: 25, color: "hsl(var(--primary) / 0.8)" },
  { name: "Meals", value: 20, color: "hsl(var(--primary) / 0.6)" },
  { name: "Desserts", value: 12, color: "hsl(var(--primary) / 0.4)" },
  { name: "Others", value: 8, color: "hsl(var(--muted))" },
];

const recentTransactions = [
  { id: "TRX-8923", time: "21:42", items: 3, total: 450, method: "UPI", status: "Completed" },
  { id: "TRX-8922", time: "21:15", items: 1, total: 120, method: "Cash", status: "Completed" },
  { id: "TRX-8921", time: "20:55", items: 5, total: 1250, method: "Card", status: "Completed" },
  { id: "TRX-8920", time: "20:30", items: 2, total: 340, method: "UPI", status: "Completed" },
  { id: "TRX-8919", time: "20:12", items: 4, total: 890, method: "UPI", status: "Completed" },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {change}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { user } = useSession();
  const isAdmin = user?.role === "admin";
  const [dateRange, setDateRange] = useState("today");
  
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Monitor your business performance and access detailed insights.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px]">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Outlets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outlets</SelectItem>
                    <SelectItem value="main">Main Branch</SelectItem>
                    <SelectItem value="downtown">Downtown</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                  title="Total Revenue" 
                  value="₹47,500" 
                  change="+12.5%" 
                  trend="up" 
                  icon={Wallet} 
                />
                <MetricCard 
                  title="Total Orders" 
                  value="156" 
                  change="+8.2%" 
                  trend="up" 
                  icon={Receipt} 
                />
                <MetricCard 
                  title="Average Order Value" 
                  value="₹304" 
                  change="+3.1%" 
                  trend="up" 
                  icon={Activity} 
                />
                <MetricCard 
                  title="Refunds" 
                  value="₹1,250" 
                  change="-2.4%" 
                  trend="down" 
                  icon={CreditCard} 
                />
              </div>

              {/* Charts Row */}
              <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
                <Card className="md:col-span-4 lg:col-span-5">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
                      <CardDescription>Hourly revenue for the selected period</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(val) => `₹${val}`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => [`₹${value}`, "Revenue"]}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorRev)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-3 lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Sales by Category</CardTitle>
                    <CardDescription>Top performing categories</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => [`${value}%`, "Share"]}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {categoryData.slice(0, 3).map((category) => (
                        <div key={category.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                            <span>{category.name}</span>
                          </div>
                          <span className="font-medium">{category.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
                  <CardDescription>Latest orders from all active outlets.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((trx) => (
                        <TableRow key={trx.id}>
                          <TableCell className="font-medium">{trx.id}</TableCell>
                          <TableCell>{trx.time}</TableCell>
                          <TableCell>{trx.items}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal bg-muted">
                              {trx.method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="font-normal bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                              {trx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{trx.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Analysis</CardTitle>
                  <CardDescription>Detailed view of sales volume and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        />
                        <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                        <Bar yAxisId="right" dataKey="orders" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Complete history of all transactions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Repeat recent transactions a few times to simulate full list */}
                      {[...recentTransactions, ...recentTransactions].map((trx, i) => (
                        <TableRow key={`${trx.id}-${i}`}>
                          <TableCell className="font-medium">{trx.id}</TableCell>
                          <TableCell>{trx.time}</TableCell>
                          <TableCell>{trx.items}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal bg-muted">
                              {trx.method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="font-normal bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                              {trx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{trx.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
