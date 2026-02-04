# Reporting Module Vision & Architecture

**Project:** stock-management  
**Created:** January 30, 2026  
**Status:** Placeholder UI Complete - Implementation Phase Ready  

---

## Executive Summary

The reporting module will provide comprehensive business analytics with a **Report Builder Pattern** - allowing users to configure, customize, and export reports based on their role (Admin vs Manager) and specific business needs.

**Key Design Principle:** Reports complement the real-time dashboard by providing historical analysis, comparisons, and detailed breakdowns that inform strategic decisions.

---

## User Roles & Permissions

### Admin (Full Access)
- **Scope:** All outlets across the organization
- **Features:** 
  - View reports for any outlet or all outlets combined
  - Compare outlet performance (Outlet A vs Outlet B)
  - Access all report types (Sales, Inventory)
  - Export data for all outlets

### Manager (Restricted Access)
- **Scope:** Single outlet only (their assigned outlet)
- **Features:**
  - View reports for their outlet only
  - Compare time periods (This Week vs Last Week, This Month vs Last Month)
  - Access Sales and Inventory reports
  - Export data for their outlet only

---

## Report Types

### 1. Sales Reports
**Purpose:** Revenue analysis, trend identification, and performance tracking

**Key Metrics:**
- Total Revenue
- Number of Orders
- Average Order Value (AOV)
- Top Selling Items
- Category Breakdown
- Payment Method Split (UPI vs Cash)
- Hourly/Daily Trends

**Visualizations:**
- Revenue trend chart (area/line chart)
- Top items bar chart
- Category pie/donut chart
- Payment method split
- Hourly heatmap

**Table Data:**
| Date | Outlet | Orders | Revenue | AOV | Payment Split |

---

### 2. Inventory Reports
**Purpose:** Stock movement tracking, wastage analysis, and replenishment planning

**Key Metrics:**
- Stock Levels (Opening, Sold, Wastage, Closing)
- Stock Turnover Rate
- Wastage Percentage
- Low Stock Alerts
- Item-wise Movement

**Visualizations:**
- Stock level trends (line chart per item)
- Wastage analysis (bar chart)
- Low stock alerts (alert cards)
- Category-wise stock distribution

**Table Data:**
| Item | Category | Opening | Sold | Wastage | Closing | Turnover Rate |

---

## Date Range Options

### Quick Select (Primary Use Cases)
1. **Today** - Current day's data (real-time view)
2. **Yesterday** - Previous full day
3. **This Week** - Current week (Mon-Sun)
4. **Last Week** - Previous week
5. **This Month** - Current calendar month
6. **Last Month** - Previous calendar month

### Custom Range (Secondary Use Case)
- **Date Picker:** Start date → End date
- **Use Case:** "Show me sales from Jan 15-20 for the festival period"

---

## Comparison Features

### For Managers (Time-Based)
- **This Week vs Last Week**
- **This Month vs Last Month**
- **Today vs Yesterday**
- **Custom period vs Previous period**

**Visual Indicators:**
- Percentage change (↑ 12% vs last week)
- Trend arrows
- Side-by-side charts

### For Admins (Outlet-Based + Time-Based)
- **Outlet A vs Outlet B** (same time period)
- **All Outlets Ranking** (bar chart)
- **Outlet performance over time** (multi-line chart)
- **Time-based comparisons** (same as managers)

---

## UI Design Pattern: Report Builder

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  REPORTS                                    [Date] [Export ▼]   │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  📊 REPORT TYPE  │      📈 REPORT PREVIEW                       │
│  ─────────────── │      ┌─────────────────────────────────┐     │
│  ● Sales         │      │  Key Metrics Cards (4-6 cards)  │     │
│  ○ Inventory     │      └─────────────────────────────────┘     │
│                  │                                              │
│  📅 DATE RANGE   │      ┌─────────────────────────────────┐     │
│  ─────────────── │      │  Main Visualization (Chart)     │     │
│  ● Today         │      │  Revenue / Stock Trends         │     │
│  ○ Yesterday     │      └─────────────────────────────────┘     │
│  ○ This Week     │                                              │
│  ○ Last Week     │      ┌─────────────────────────────────┐     │
│  ○ This Month    │      │  Secondary Visualizations       │     │
│  ○ Last Month    │      │  (2-3 comparison charts)        │     │
│  ○ Custom...     │      └─────────────────────────────────┘     │
│                  │                                              │
│  🏪 OUTLET       │      ┌─────────────────────────────────┐     │
│  ─────────────── │      │  Detailed Data Table            │     │
│  ☑ All Outlets   │      │  Sortable, Filterable, Paginated│     │
│  ☑ Outlet A      │      └─────────────────────────────────┘     │
│  ☑ Outlet B      │                                              │
│  ☑ Outlet C      │                                              │
│                  │                                              │
│  📊 COMPARE      │                                              │
│  ─────────────── │                                              │
│  ○ No Compare    │                                              │
│  ● vs Last Week  │                                              │
│  ○ vs Last Month │                                              │
│  ○ vs Outlet X   │  [Admin Only]                                │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Report Type Selector (Left Sidebar - Top)
- **Card-based selection** (matches existing UI style)
- Icons: 📊 Sales, 📦 Inventory
- Active state: Primary color highlight
- Click to switch report context

#### 2. Date Range Selector (Left Sidebar - Middle)
- **Radio button group** for quick selects
- **Custom date picker** (appears when "Custom" selected)
- Default: "Today" for immediate insights

#### 3. Outlet Selector (Left Sidebar - Admin Only)
- **Checkbox list** of all outlets
- "Select All" option at top
- Default: "All Outlets" for admin overview
- **Hidden for managers** (auto-set to their outlet)

#### 4. Comparison Selector (Left Sidebar - Bottom)
- **Dropdown or toggle** for comparison mode
- Options change based on role:
  - Manager: Time-based only
  - Admin: Time-based + Outlet-based

#### 5. Main Content Area (Right Side)

**Top Section: Key Metrics**
- 4-6 metric cards in a grid
- Shows totals for selected period
- Comparison indicators (↑↓ percentages)

**Middle Section: Visualizations**
- Primary chart (large, full width)
- Secondary charts (2-3 smaller charts side-by-side)
- Charts update dynamically based on selections

**Bottom Section: Data Table**
- Detailed breakdown table
- Sortable columns
- Pagination (10/25/50/100 rows)
- Search/filter within results
- Export button (CSV, Excel, PDF)

---

## Data Flow Architecture

### Report Generation Process

```
User Selections → Query Builder → Data Fetch → Transform → Render
     ↓                ↓              ↓           ↓         ↓
[Report Type]    [SQL Query]    [Supabase]   [Format]  [UI]
[Date Range]        ↓              ↓           ↓         ↓
[Outlet(s)]    [Filters]    [Aggregations]  [Charts]  [Tables]
[Compare]          ↓              ↓           ↓         ↓
              [Grouping]      [Cache]     [Export]
```

### Query Strategy

**Sales Reports:**
```sql
SELECT 
  DATE(created_at) as date,
  outlet_id,
  COUNT(*) as orders,
  SUM(total_amount) as revenue,
  AVG(total_amount) as aov,
  SUM(CASE WHEN payment_method = 'UPI' THEN total_amount ELSE 0 END) as upi_total,
  SUM(CASE WHEN payment_method = 'Cash' THEN total_amount ELSE 0 END) as cash_total
FROM transactions
WHERE created_at BETWEEN :start_date AND :end_date
  AND outlet_id IN (:outlet_ids)
GROUP BY DATE(created_at), outlet_id
ORDER BY date DESC;
```

**Inventory Reports:**
```sql
SELECT 
  mi.name as item_name,
  mi.category,
  SUM(ds.quantity) as opening_stock,
  SUM(ti.quantity) as sold_quantity,
  SUM(ds.wastage) as wastage,
  (SUM(ds.quantity) - SUM(ti.quantity) - SUM(ds.wastage)) as closing_stock
FROM daily_stocks ds
JOIN menu_items mi ON ds.item_id = mi.id
LEFT JOIN transaction_items ti ON ds.item_id = ti.item_id
WHERE ds.stock_date BETWEEN :start_date AND :end_date
  AND ds.outlet_id IN (:outlet_ids)
GROUP BY mi.id, mi.name, mi.category;
```

---

## Export Functionality

### Export Formats
1. **CSV** - Raw data for Excel/analysis tools
2. **Excel** - Formatted with charts (if possible)
3. **PDF** - Formatted report for sharing/printing

### Export Scope
- Respects current filters (date range, outlets)
- Exports visible table data + summary metrics
- Option to export charts as images (PDF)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create placeholder UI with report builder layout
- [ ] Implement report type selector (Sales/Inventory)
- [ ] Build date range picker component
- [ ] Create outlet selector (admin only)
- [ ] Set up basic state management for selections

### Phase 2: Sales Reports (Week 2)
- [ ] Sales data fetching with filters
- [ ] Key metrics calculation (revenue, orders, AOV)
- [ ] Revenue trend chart (area chart)
- [ ] Top selling items table
- [ ] Payment method breakdown
- [ ] Export to CSV functionality

### Phase 3: Inventory Reports (Week 3)
- [ ] Inventory data fetching with filters
- [ ] Stock movement calculations
- [ ] Stock level trend chart
- [ ] Wastage analysis table
- [ ] Low stock alerts
- [ ] Export functionality

### Phase 4: Comparison Features (Week 4)
- [ ] Time-based comparisons (week-over-week)
- [ ] Outlet comparison for admins
- [ ] Comparison visualizations (dual charts)
- [ ] Percentage change indicators
- [ ] Export comparison reports

### Phase 5: Polish & Optimization (Week 5)
- [ ] PDF export with charts
- [ ] Excel export with formatting
- [ ] Caching for repeated queries
- [ ] Loading states and skeletons
- [ ] Error handling and empty states
- [ ] Mobile responsiveness

---

## Technical Considerations

### Performance Optimization
- **Query Caching:** Cache results for 5 minutes to reduce database load
- **Pagination:** Load table data in chunks (10-100 rows)
- **Debouncing:** Wait for user to finish selecting before fetching
- **Lazy Loading:** Load charts only when visible

### Database Indexes Needed
```sql
-- For date range queries
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_daily_stocks_stock_date ON daily_stocks(stock_date);

-- For outlet filtering
CREATE INDEX idx_transactions_outlet_id ON transactions(outlet_id);
CREATE INDEX idx_daily_stocks_outlet_id ON daily_stocks(outlet_id);

-- For aggregations
CREATE INDEX idx_transactions_outlet_created ON transactions(outlet_id, created_at);
```

### Security
- **RLS Policies:** Ensure managers can only see their outlet data
- **Query Validation:** Validate date ranges (max 90 days for performance)
- **Export Limits:** Limit export size to prevent timeouts

---

## UI/UX Guidelines

### Visual Hierarchy
1. **Primary:** Key metric cards (large numbers, bold)
2. **Secondary:** Main chart (takes most visual space)
3. **Tertiary:** Secondary charts and tables

### Interaction Patterns
- **Instant Feedback:** Show loading state immediately on selection change
- **Progressive Disclosure:** Advanced filters in expandable sections
- **Smart Defaults:** Pre-select "Today" and "All Outlets" (admin) or user's outlet (manager)
- **Contextual Actions:** Export button always visible, disabled until data loads

### Responsive Behavior
- **Desktop (>1024px):** Full sidebar + content layout
- **Tablet (768-1024px):** Collapsible sidebar, stacked charts
- **Mobile (<768px):** Bottom sheet for filters, single column layout

---

## Success Metrics

### User Experience
- Time to generate report: < 3 seconds
- Time to export: < 5 seconds
- User can create custom report in < 30 seconds

### Business Value
- Managers check reports daily (adoption metric)
- Admins use outlet comparison for decisions
- Export feature used weekly

---

## Future Enhancements (Post-MVP)

### Phase 6: Advanced Features
- [ ] Scheduled reports (daily/weekly email)
- [ ] Saved report templates
- [ ] Custom date presets ("Festival Week", "Holiday Season")
- [ ] Anomaly detection ("Sales dropped 30% vs last week")
- [ ] Predictive analytics (forecast next week's sales)
- [ ] Staff performance reports (when needed)

### Phase 7: Integration
- [ ] Google Sheets integration
- [ ] Slack notifications for daily summaries
- [ ] Webhook support for external systems

---

## File Structure

```
app/
├── reports/
│   ├── page.tsx                 # Main reports page
│   ├── components/
│   │   ├── report-builder.tsx   # Sidebar with filters
│   │   ├── report-preview.tsx   # Main content area
│   │   ├── sales-report.tsx     # Sales-specific view
│   │   ├── inventory-report.tsx # Inventory-specific view
│   │   ├── metric-cards.tsx     # Key metrics display
│   │   ├── date-range-picker.tsx
│   │   ├── outlet-selector.tsx
│   │   └── comparison-toggle.tsx
│   └── hooks/
│       ├── use-report-data.ts   # Data fetching hook
│       └── use-export.ts        # Export functionality
├── lib/
│   └── reports/
│       ├── queries.ts           # SQL query builders
│       ├── calculations.ts      # Metric calculations
│       └── export-utils.ts      # Export formatters
└── docs/
    └── REPORTING_VISION.md      # This document
```

---

## Open Questions

1. **Data Retention:** How long should transaction data be kept? (Affects query performance)
2. **Real-time Reports:** Should reports auto-refresh for "Today" view?
3. **Custom Metrics:** Any business-specific KPIs to track?
4. **Multi-Currency:** Will you need to support multiple currencies?
5. **Offline Access:** Should exported reports be viewable offline?

---

**Document Version:** 1.0  
**Last Updated:** January 30, 2026  
**Next Review:** February 15, 2026  
**Owner:** Frontend Team

---

## Appendix: UI Component Specifications

### Metric Card Component
```
┌─────────────────────────────┐
│  [Icon]  LABEL              │
│                             │
│  ₹45,230                    │  ← Large number
│  ↑ 12% vs last week         │  ← Comparison (green/red)
└─────────────────────────────┘
```

### Date Range Picker
```
Quick Select:
○ Today  ● Yesterday  ○ This Week
○ Last Week  ○ This Month  ○ Custom

Custom Range:
[Start Date] → [End Date]
[ 2026-01-20 ]    [ 2026-01-30 ]
```

### Outlet Selector (Admin)
```
☑ All Outlets (3 selected)
─────────────────────────
☑ Main Branch
☑ Downtown Outlet
☑ Airport Kiosk
☐ New Outlet (inactive)
```

---

**End of Document**
