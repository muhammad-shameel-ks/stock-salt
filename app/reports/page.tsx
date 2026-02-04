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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
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
  X,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useSession } from "@/contexts/session-context";

// Report types
const REPORT_TYPES = [
  { id: "sales", label: "Sales", icon: BarChart3, description: "Revenue & orders" },
  { id: "inventory", label: "Inventory", icon: Package, description: "Stock & movement" },
];

// Date range options
const DATE_RANGES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week", label: "This Week" },
  { id: "last_week", label: "Last Week" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "custom", label: "Custom..." },
];

// Mock outlets - replace with actual data from your API
const MOCK_OUTLETS = [
  { id: "all", name: "All Outlets" },
  { id: "1", name: "Main Branch" },
  { id: "2", name: "Downtown" },
  { id: "3", name: "Airport" },
];

// Comparison options
const COMPARISON_OPTIONS = [
  { id: "none", label: "No Comparison" },
  { id: "last_period", label: "vs Last Period" },
  { id: "last_year", label: "vs Last Year" },
];

// Filter Panel Component (used in both sidebar and sheet)
function FilterPanel({
  selectedReport,
  setSelectedReport,
  dateRange,
  setDateRange,
  selectedOutlets,
  setSelectedOutlets,
  comparison,
  setComparison,
  isAdmin,
  onGenerate,
  isGenerating,
}: {
  selectedReport: string;
  setSelectedReport: (id: string) => void;
  dateRange: string;
  setDateRange: (id: string) => void;
  selectedOutlets: string[];
  setSelectedOutlets: (ids: string[]) => void;
  comparison: string;
  setComparison: (id: string) => void;
  isAdmin: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
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

  return (
    <div className="space-y-4">
      {/* Report Type Selector */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">
          Report Type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                selectedReport === report.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/30 hover:border-primary/20"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${
                selectedReport === report.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              }`}>
                <report.icon className="h-4 w-4" />
              </div>
              <p className="font-black text-xs uppercase leading-none">{report.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">
          Date Range
        </p>
        <div className="bg-muted/30 rounded-xl p-3 border-2">
          <RadioGroup value={dateRange} onValueChange={setDateRange} className="grid grid-cols-2 gap-2">
            {DATE_RANGES.map((range) => (
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
          </RadioGroup>
          
          {dateRange === "custom" && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
              <div>
                <Label className="text-[9px] font-black uppercase opacity-40 mb-1 block">From</Label>
                <input 
                  type="date" 
                  className="w-full h-9 px-3 rounded-lg border-2 bg-background font-bold text-xs"
                />
              </div>
              <div>
                <Label className="text-[9px] font-black uppercase opacity-40 mb-1 block">To</Label>
                <input 
                  type="date" 
                  className="w-full h-9 px-3 rounded-lg border-2 bg-background font-bold text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outlet Selector - Admin Only */}
      {isAdmin && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">
            Outlets
          </p>
          <div className="bg-muted/30 rounded-xl p-3 border-2 space-y-2">
            {MOCK_OUTLETS.map((outlet) => (
              <div key={outlet.id} className="flex items-center space-x-3">
                <Checkbox 
                  id={`mobile-${outlet.id}`}
                  checked={selectedOutlets.includes(outlet.id)}
                  onCheckedChange={() => handleOutletToggle(outlet.id)}
                  className="border-2 h-4 w-4"
                />
                <Label 
                  htmlFor={`mobile-${outlet.id}`} 
                  className="text-xs font-bold uppercase cursor-pointer flex-1"
                >
                  {outlet.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Selector */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">
          Compare With
        </p>
        <Select value={comparison} onValueChange={setComparison}>
          <SelectTrigger className="h-11 rounded-xl border-2 font-bold uppercase text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPARISON_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id} className="font-bold uppercase text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <Button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full h-12 rounded-xl font-black italic uppercase text-base tracking-tighter"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </>
        )}
      </Button>
    </div>
  );
}

export default function ReportsPage() {
  const { user } = useSession();
  const isAdmin = user?.role === "admin";
  const isMobile = useIsMobile();
  
  // State for report builder
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState("today");
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>(["all"]);
  const [comparison, setComparison] = useState("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Mock report generation
  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setFilterSheetOpen(false);
    }, 1500);
  };

  // Summary for mobile filter button
  const getFilterSummary = () => {
    const parts = [];
    parts.push(REPORT_TYPES.find(r => r.id === selectedReport)?.label);
    parts.push(DATE_RANGES.find(r => r.id === dateRange)?.label);
    if (isAdmin && !selectedOutlets.includes("all")) {
      parts.push(`${selectedOutlets.length} outlet${selectedOutlets.length > 1 ? 's' : ''}`);
    }
    return parts.join(" • ");
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-4 md:gap-6 bg-muted/20 min-h-screen">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Reports Module</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">Report Builder</h1>
              <p className="text-muted-foreground font-medium text-xs md:text-sm mt-2">
                Generate custom reports and analytics
              </p>
            </div>
            <Badge variant="outline" className="h-8 md:h-10 px-3 md:px-4 rounded-2xl bg-background border-2 font-black italic border-primary/20 text-primary w-fit">
              <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              {isAdmin ? "Admin" : "Manager"}
            </Badge>
          </div>

          {/* Mobile Filter Bar */}
          {isMobile && (
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-2 font-black italic uppercase justify-between px-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <SlidersHorizontal className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs opacity-50 font-black uppercase tracking-wider">Filters</p>
                      <p className="text-sm">{getFilterSummary()}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-50" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] border-t-2">
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Report Filters
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(85vh-140px)] px-1 py-4">
                  <FilterPanel
                    selectedReport={selectedReport}
                    setSelectedReport={setSelectedReport}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    selectedOutlets={selectedOutlets}
                    setSelectedOutlets={setSelectedOutlets}
                    comparison={comparison}
                    setComparison={setComparison}
                    isAdmin={isAdmin}
                    onGenerate={generateReport}
                    isGenerating={isGenerating}
                  />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}

          {/* Main Content - Report Builder Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            
            {/* Left Sidebar - Desktop Only */}
            {!isMobile && (
              <div className="lg:col-span-3 space-y-4 md:space-y-6">
                <Card className="rounded-[2rem] border-2 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      Report Configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FilterPanel
                      selectedReport={selectedReport}
                      setSelectedReport={setSelectedReport}
                      dateRange={dateRange}
                      setDateRange={setDateRange}
                      selectedOutlets={selectedOutlets}
                      setSelectedOutlets={setSelectedOutlets}
                      comparison={comparison}
                      setComparison={setComparison}
                      isAdmin={isAdmin}
                      onGenerate={generateReport}
                      isGenerating={isGenerating}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Right Content - Report Preview */}
            <div className="lg:col-span-9 space-y-4 md:space-y-6">
              
              {/* Export Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-2xl bg-card border-2 shadow-sm gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="h-7 md:h-8 rounded-full font-black italic text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {DATE_RANGES.find(r => r.id === dateRange)?.label}
                  </Badge>
                  {isAdmin && (
                    <Badge variant="outline" className="h-7 md:h-8 rounded-full font-black italic text-xs">
                      <Store className="h-3 w-3 mr-1" />
                      {selectedOutlets.includes("all") ? "All" : `${selectedOutlets.length}`}
                    </Badge>
                  )}
                  {comparison !== "none" && (
                    <Badge variant="outline" className="h-7 md:h-8 rounded-full font-black italic border-primary/50 text-primary text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Compare
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs whitespace-nowrap">
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs whitespace-nowrap">
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs whitespace-nowrap">
                    <Download className="h-3 w-3 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Key Metrics Cards - Responsive Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Revenue", value: "₹0", change: "+0%", trend: "up" },
                  { label: "Orders", value: "0", change: "+0%", trend: "up" },
                  { label: "Avg Order", value: "₹0", change: "+0%", trend: "up" },
                  { label: "Items", value: "0", change: "+0%", trend: "down" },
                ].map((metric, i) => (
                  <Card key={i} className="rounded-[1.5rem] md:rounded-[2rem] border-2 shadow-lg">
                    <CardContent className="p-4 md:p-6">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 md:mb-2">
                        {metric.label}
                      </p>
                      <p className="text-xl md:text-3xl font-black italic tracking-tighter mb-1 md:mb-2">
                        {metric.value}
                      </p>
                      <div className={`flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase ${
                        metric.trend === "up" ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        )}
                        {metric.change}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Chart Placeholder */}
              <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-2 shadow-xl overflow-hidden">
                <div className="p-4 md:p-8 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">
                        {selectedReport === "sales" ? "Revenue Trend" : "Stock Movement"}
                      </h3>
                      <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 md:mt-1">
                        {comparison !== "none" ? "With comparison data" : "Selected period overview"}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-7 rounded-full font-black italic text-xs w-fit">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Interactive
                    </Badge>
                  </div>
                </div>
                <div className="p-6 md:p-12 flex flex-col items-center justify-center text-center min-h-[250px] md:min-h-[300px]">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-muted flex items-center justify-center mb-4 md:mb-6">
                    <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground opacity-40" />
                  </div>
                  <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tighter mb-2">
                    Chart Preview
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-md mb-4 md:mb-6 px-4">
                    {selectedReport === "sales" 
                      ? "Revenue trend chart will display here showing daily/weekly revenue progression."
                      : "Stock movement chart will display here showing inventory levels over time."
                    }
                  </p>
                  <Button 
                    onClick={generateReport}
                    disabled={isGenerating}
                    variant="outline"
                    className="rounded-full font-black italic text-sm"
                    size={isMobile ? "sm" : "default"}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Generate to View
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Secondary Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-2 shadow-lg">
                  <CardHeader className="pb-2 p-4 md:p-6">
                    <CardDescription className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
                      {selectedReport === "sales" ? "Top Selling Items" : "Stock by Category"}
                    </CardDescription>
                    <CardTitle className="text-base md:text-lg font-black italic tracking-tighter">
                      Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="min-h-[150px] md:min-h-[200px] flex items-center justify-center p-4 md:p-6">
                    <div className="text-center opacity-40">
                      <Package className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3" />
                      <p className="text-xs md:text-sm font-black uppercase tracking-widest">Data visualization</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-2 shadow-lg">
                  <CardHeader className="pb-2 p-4 md:p-6">
                    <CardDescription className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
                      {selectedReport === "sales" ? "Payment Methods" : "Wastage Analysis"}
                    </CardDescription>
                    <CardTitle className="text-base md:text-lg font-black italic tracking-tighter">
                      Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="min-h-[150px] md:min-h-[200px] flex items-center justify-center p-4 md:p-6">
                    <div className="text-center opacity-40">
                      <TrendingUp className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3" />
                      <p className="text-xs md:text-sm font-black uppercase tracking-widest">Data visualization</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table Placeholder */}
              <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-2 shadow-xl overflow-hidden">
                <div className="p-4 md:p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">
                      Detailed Data
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 md:mt-1">
                      Sortable, filterable breakdown
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full font-black italic text-xs">
                      <Filter className="h-3 w-3 mr-1" />
                      Filter
                    </Button>
                    <Select defaultValue="10">
                      <SelectTrigger className="w-20 md:w-24 h-8 rounded-full font-black italic text-xs">
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
                <div className="p-6 md:p-12 text-center">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <FileSpreadsheet className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground opacity-40" />
                  </div>
                  <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tighter mb-2">
                    Data Table
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto mb-4 md:mb-6 px-4">
                    Detailed transaction or inventory data will appear here in a sortable, paginated table format.
                  </p>
                  <Button 
                    onClick={generateReport}
                    disabled={isGenerating}
                    variant="outline"
                    className="rounded-full font-black italic text-sm"
                    size={isMobile ? "sm" : "default"}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Load Data
                      </>
                    )}
                  </Button>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
