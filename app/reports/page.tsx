"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  BarChart3, 
  Package, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  Store,
  FileSpreadsheet,
  FileText,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  PieChart,
  Activity,
  ArrowUpRight,
  Wallet,
  CreditCard,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useSession } from "@/contexts/session-context";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell, PieChart as RePieChart, Pie } from "recharts";

// Report types with icons
const REPORT_TYPES = [
  { id: "sales", label: "Sales", icon: BarChart3, description: "Revenue & orders", color: "bg-primary" },
  { id: "inventory", label: "Inventory", icon: Package, description: "Stock & movement", color: "bg-emerald-500" },
  { id: "financial", label: "Financial", icon: Wallet, description: "Payments & margins", color: "bg-violet-500" },
  { id: "operations", label: "Operations", icon: Activity, description: "Performance & KPIs", color: "bg-orange-500" },
];

// Date range options
const DATE_RANGES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week", label: "This Week" },
  { id: "last_week", label: "Last Week" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

// Mock outlets
const MOCK_OUTLETS = [
  { id: "all", name: "All Outlets" },
  { id: "1", name: "Main Branch" },
  { id: "2", name: "Downtown" },
  { id: "3", name: "Airport Terminal" },
  { id: "4", name: "Mall Location" },
];

// Mock chart data
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
  { name: "Snacks", value: 25, color: "hsl(var(--primary) / 0.7)" },
  { name: "Meals", value: 20, color: "hsl(var(--primary) / 0.5)" },
  { name: "Desserts", value: 12, color: "hsl(var(--primary) / 0.3)" },
  { name: "Others", value: 8, color: "hsl(var(--muted-foreground))" },
];

// Filter Panel Component
function FilterPanel({
  selectedReport,
  setSelectedReport,
  dateRange,
  setDateRange,
  selectedOutlets,
  setSelectedOutlets,
  onGenerate,
  isGenerating,
  isAdmin,
}: {
  selectedReport: string;
  setSelectedReport: (id: string) => void;
  dateRange: string;
  setDateRange: (id: string) => void;
  selectedOutlets: string[];
  setSelectedOutlets: (ids: string[]) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isAdmin: boolean;
}) {
  const handleOutletToggle = (outletId: string) => {
    if (outletId === "all") {
      setSelectedOutlets(["all"]);
    } else {
      const newSelection = selectedOutlets.includes(outletId)
        ? selectedOutlets.filter(id => id !== outletId)
        : [...selectedOutlets.filter(id => id !== "all"), outletId];
      setSelectedOutlets(newSelection.length === 0 ? ["all"] : newSelection);
    }
  };

  const selectedReportType = REPORT_TYPES.find(r => r.id === selectedReport);

  return (
    <div className="space-y-6">
      {/* Report Type Selector - Hub Style */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          Report Type
        </p>
        <div className="grid grid-cols-2 gap-3">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-[2rem] border-2 transition-all duration-200 text-left group active:scale-95 ${
                selectedReport === report.id
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-transparent bg-muted/30 hover:border-primary/20 hover:bg-muted/50"
              }`}
            >
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                selectedReport === report.id ? report.color : "bg-muted"
              } ${selectedReport === report.id ? "text-white" : "text-muted-foreground"}`}>
                <report.icon className="h-5 w-5" />
              </div>
              <p className="font-black text-sm uppercase leading-tight mb-1">{report.label}</p>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">{report.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          Date Range
        </p>
        <div className="bg-muted/30 rounded-[2rem] p-4 border-2">
          <RadioGroup value={dateRange} onValueChange={setDateRange} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {DATE_RANGES.slice(0, 6).map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={range.id} id={range.id} className="border-2 h-4 w-4" />
                  <Label 
                    htmlFor={range.id} 
                    className="text-xs font-bold uppercase cursor-pointer flex-1"
                  >
                    {range.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" className="border-2 h-4 w-4" />
                <Label 
                  htmlFor="custom" 
                  className="text-xs font-bold uppercase cursor-pointer flex-1"
                >
                  Custom Range
                </Label>
              </div>
            </div>
          </RadioGroup>
          
          {dateRange === "custom" && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              <div>
                <Label className="text-[9px] font-black uppercase opacity-40 mb-2 block">From</Label>
                <input 
                  type="date" 
                  className="w-full h-11 px-4 rounded-2xl border-2 bg-background font-bold text-xs"
                />
              </div>
              <div>
                <Label className="text-[9px] font-black uppercase opacity-40 mb-2 block">To</Label>
                <input 
                  type="date" 
                  className="w-full h-11 px-4 rounded-2xl border-2 bg-background font-bold text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outlet Selector - Admin Only */}
      {isAdmin && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            Outlets
          </p>
          <div className="bg-muted/30 rounded-[2rem] p-4 border-2 space-y-3">
            {MOCK_OUTLETS.map((outlet) => (
              <div key={outlet.id} className="flex items-center space-x-3">
                <Checkbox 
                  id={`outlet-${outlet.id}`}
                  checked={selectedOutlets.includes(outlet.id)}
                  onCheckedChange={() => handleOutletToggle(outlet.id)}
                  className="border-2 h-4 w-4 rounded-lg"
                />
                <Label 
                  htmlFor={`outlet-${outlet.id}`} 
                  className="text-xs font-bold uppercase cursor-pointer flex-1"
                >
                  {outlet.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full h-14 rounded-full font-black italic uppercase text-base tracking-tighter shadow-lg shadow-primary/20 active:scale-95 transition-all"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 mr-2" />
            Generate Report
          </>
        )}
      </Button>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  label, 
  value, 
  change, 
  trend, 
  icon: Icon,
  variant = "default" 
}: { 
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  variant?: "default" | "primary" | "success";
}) {
  const variants = {
    default: "bg-card",
    primary: "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground",
    success: "bg-gradient-to-br from-emerald-500 via-emerald-500/90 to-emerald-500/80 text-white",
  };

  return (
    <Card className={`rounded-[2rem] border-2 shadow-lg overflow-hidden ${variants[variant]} group hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
            variant === "default" ? "bg-muted" : "bg-white/20"
          }`}>
            <Icon className={`h-6 w-6 ${variant === "default" ? "text-primary" : "text-white"}`} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold uppercase ${
            trend === "up" 
              ? variant === "default" ? "text-emerald-600" : "text-white/80"
              : trend === "down"
              ? variant === "default" ? "text-red-600" : "text-white/80"
              : variant === "default" ? "text-muted-foreground" : "text-white/60"
          }`}>
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {change}
          </div>
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
          variant === "default" ? "opacity-40" : "text-white/60"
        }`}>
          {label}
        </p>
        <p className={`text-2xl md:text-3xl font-black italic tracking-tighter tabular-nums ${
          variant === "default" ? "" : "text-white"
        }`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { user } = useSession();
  const isAdmin = user?.role === "admin";
  const isMobile = useIsMobile();
  
  // State
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState("today");
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>(["all"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setFilterSheetOpen(false);
    }, 1500);
  };

  const getFilterSummary = () => {
    const parts = [];
    parts.push(REPORT_TYPES.find(r => r.id === selectedReport)?.label);
    parts.push(DATE_RANGES.find(r => r.id === dateRange)?.label);
    if (isAdmin && !selectedOutlets.includes("all")) {
      parts.push(`${selectedOutlets.length} outlet${selectedOutlets.length > 1 ? 's' : ''}`);
    }
    return parts.join(" • ");
  };

  const selectedReportType = REPORT_TYPES.find(r => r.id === selectedReport);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-muted/20 min-h-screen">
          
          {/* Hero Banner - Salt Premium Style */}
          <div className="relative overflow-hidden p-4 md:p-6">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 md:p-10 rounded-[2.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden">
              <div className="max-w-screen-xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                        Analytics Hub
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white mb-2">
                      Reports
                    </h1>
                    <p className="text-white/70 font-medium text-sm md:text-base">
                      Generate insights and track performance across your network
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="h-10 px-4 rounded-2xl bg-white/10 border-2 border-white/20 font-black italic text-white w-fit backdrop-blur-md"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {isAdmin ? "Admin View" : "Manager View"}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Floating Action Footer for Mobile */}
            {isMobile && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent pt-8 pb-4 px-4">
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-14 rounded-full border-2 font-black italic uppercase justify-between px-6 shadow-lg bg-background/90 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <SlidersHorizontal className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs opacity-50 font-black uppercase tracking-wider">Configure Report</p>
                          <p className="text-sm">{getFilterSummary()}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 opacity-50" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh] rounded-t-[2.5rem] border-t-2 p-0">
                    <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
                      <SheetTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Report Configuration
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(90vh-120px)] px-6 py-6">
                      <FilterPanel
                        selectedReport={selectedReport}
                        setSelectedReport={setSelectedReport}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        selectedOutlets={selectedOutlets}
                        setSelectedOutlets={setSelectedOutlets}
                        onGenerate={generateReport}
                        isGenerating={isGenerating}
                        isAdmin={isAdmin}
                      />
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="p-4 md:p-8 gap-6 md:gap-8 flex-1">
            <div className="max-w-screen-xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* Left Sidebar - Desktop Only */}
                {!isMobile && (
                  <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                    <Card className="rounded-[2.5rem] border-2 shadow-xl sticky top-6">
                      <CardHeader className="pb-2 pt-6 px-6">
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                          Configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        <FilterPanel
                          selectedReport={selectedReport}
                          setSelectedReport={setSelectedReport}
                          dateRange={dateRange}
                          setDateRange={setDateRange}
                          selectedOutlets={selectedOutlets}
                          setSelectedOutlets={setSelectedOutlets}
                          onGenerate={generateReport}
                          isGenerating={isGenerating}
                          isAdmin={isAdmin}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Right Content - Report Preview */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                  
                  {/* Tabs Navigation */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="h-14 rounded-full bg-muted/50 p-1.5 border-2 w-full md:w-auto">
                      <TabsTrigger 
                        value="overview" 
                        className="h-11 rounded-full font-black italic uppercase text-xs data-[state=active]:shadow-lg"
                      >
                        <Activity className="h-4 w-4 mr-2 hidden sm:inline" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="charts"
                        className="h-11 rounded-full font-black italic uppercase text-xs data-[state=active]:shadow-lg"
                      >
                        <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline" />
                        Analytics
                      </TabsTrigger>
                      <TabsTrigger 
                        value="data"
                        className="h-11 rounded-full font-black italic uppercase text-xs data-[state=active]:shadow-lg"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2 hidden sm:inline" />
                        Data
                      </TabsTrigger>
                    </TabsList>

                    {/* Export Actions Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-[2rem] bg-card border-2 shadow-sm gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="h-9 rounded-full font-black italic text-xs bg-primary/5 border-primary/20">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          {DATE_RANGES.find(r => r.id === dateRange)?.label}
                        </Badge>
                        <Badge variant="outline" className="h-9 rounded-full font-black italic text-xs">
                          <Store className="h-3 w-3 mr-1.5" />
                          {selectedOutlets.includes("all") ? "All Outlets" : `${selectedOutlets.length} Selected`}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs h-9">
                          <FileText className="h-3 w-3 mr-1.5" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs h-9">
                          <FileSpreadsheet className="h-3 w-3 mr-1.5" />
                          Excel
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs h-9">
                          <Download className="h-3 w-3 mr-1.5" />
                          CSV
                        </Button>
                      </div>
                    </div>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard 
                          label="Total Revenue" 
                          value="₹47,500" 
                          change="+12.5%" 
                          trend="up" 
                          icon={Wallet}
                          variant="primary"
                        />
                        <MetricCard 
                          label="Orders" 
                          value="156" 
                          change="+8.2%" 
                          trend="up" 
                          icon={Activity}
                        />
                        <MetricCard 
                          label="Avg Order" 
                          value="₹304" 
                          change="+3.1%" 
                          trend="up" 
                          icon={ArrowUpRight}
                        />
                        <MetricCard 
                          label="Items Sold" 
                          value="423" 
                          change="-2.4%" 
                          trend="down" 
                          icon={Package}
                        />
                      </div>

                      {/* Main Chart Card */}
                      <Card className="rounded-[2.5rem] border-2 shadow-xl overflow-hidden">
                        <div className="p-6 md:p-8 border-b bg-gradient-to-r from-muted/30 to-transparent">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                                Revenue Trend
                              </h3>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">
                                Hourly breakdown for selected period
                              </p>
                            </div>
                            <Badge variant="outline" className="h-9 rounded-full font-black italic text-xs bg-primary/5 border-primary/20 w-fit">
                              <TrendingUp className="h-3 w-3 mr-1.5" />
                              Live Data
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 md:p-6 h-[300px] md:h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                              <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 700 }}
                                tickMargin={10}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 700 }}
                                tickFormatter={(value) => `₹${value}`}
                              />
                              <Tooltip
                                contentStyle={{ 
                                  borderRadius: '20px', 
                                  border: 'none', 
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                                  fontWeight: 800,
                                  padding: '12px 16px'
                                }}
                                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                              />
                              <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>

                      {/* Secondary Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Category Breakdown */}
                        <Card className="rounded-[2.5rem] border-2 shadow-lg overflow-hidden">
                          <CardHeader className="pb-2 p-6">
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                              Sales by Category
                            </CardDescription>
                            <CardTitle className="text-lg md:text-xl font-black italic tracking-tighter">
                              Category Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 pt-0">
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                  <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                  >
                                    {categoryData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ 
                                      borderRadius: '16px', 
                                      border: 'none', 
                                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                  />
                                </RePieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              {categoryData.slice(0, 4).map((cat) => (
                                <div key={cat.name} className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                  <span className="text-xs font-bold uppercase">{cat.name}</span>
                                  <span className="text-xs font-black italic ml-auto">{cat.value}%</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <Card className="rounded-[2.5rem] border-2 shadow-lg overflow-hidden">
                          <CardHeader className="pb-2 p-6">
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                              Payment Methods
                            </CardDescription>
                            <CardTitle className="text-lg md:text-xl font-black italic tracking-tighter">
                              Transaction Split
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            {[
                              { method: "UPI", amount: 28500, percent: 60, icon: CreditCard, color: "bg-primary" },
                              { method: "Cash", amount: 15200, percent: 32, icon: Wallet, color: "bg-emerald-500" },
                              { method: "Card", amount: 3800, percent: 8, icon: CreditCard, color: "bg-violet-500" },
                            ].map((payment) => (
                              <div key={payment.method} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl ${payment.color}/10 flex items-center justify-center`}>
                                      <payment.icon className={`h-5 w-5 ${payment.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <div>
                                      <p className="font-black text-sm uppercase">{payment.method}</p>
                                      <p className="text-[10px] font-bold opacity-50 uppercase">{payment.percent}% of total</p>
                                    </div>
                                  </div>
                                  <p className="font-black italic text-lg">₹{payment.amount.toLocaleString()}</p>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div className={`h-full ${payment.color} rounded-full`} style={{ width: `${payment.percent}%` }} />
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="charts" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Card className="rounded-[2.5rem] border-2 shadow-xl overflow-hidden">
                        <div className="p-6 md:p-8 border-b bg-gradient-to-r from-muted/30 to-transparent">
                          <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                            Order Volume Analysis
                          </h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">
                            Orders per hour throughout the day
                          </p>
                        </div>
                        <div className="p-4 md:p-6 h-[350px] md:h-[450px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                              <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 700 }}
                                tickMargin={10}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 700 }}
                              />
                              <Tooltip
                                contentStyle={{ 
                                  borderRadius: '20px', 
                                  border: 'none', 
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                                  fontWeight: 800 
                                }}
                              />
                              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </TabsContent>

                    {/* Data Tab */}
                    <TabsContent value="data" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Card className="rounded-[2.5rem] border-2 shadow-xl overflow-hidden">
                        <div className="p-6 md:p-8 border-b bg-gradient-to-r from-muted/30 to-transparent">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                                Detailed Transactions
                              </h3>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">
                                Sortable, filterable data table
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs">
                                <Filter className="h-3 w-3 mr-1.5" />
                                Filter
                              </Button>
                              <Select defaultValue="25">
                                <SelectTrigger className="w-24 h-9 rounded-full font-black italic text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10" className="text-xs">10</SelectItem>
                                  <SelectItem value="25" className="text-xs">25</SelectItem>
                                  <SelectItem value="50" className="text-xs">50</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="p-8 md:p-12 text-center">
                          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                            <FileSpreadsheet className="h-10 w-10 text-muted-foreground opacity-40" />
                          </div>
                          <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">
                            Data Table
                          </h4>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                            Detailed transaction data will appear here in a sortable, paginated table format.
                          </p>
                          <Button 
                            onClick={generateReport}
                            disabled={isGenerating}
                            variant="outline"
                            className="rounded-full font-black italic"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Load Data
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
