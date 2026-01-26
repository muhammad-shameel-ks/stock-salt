# Multi-Tenant Warehouse & POS Plan

## 1. Project Vision
A minimalist, high-speed POS and inventory system for seafood restaurants. 
The goal is to allow a central Admin to distribute daily stock to outlets 
and provide staff with a "two-click" ordering interface.

## 2. User Roles
- **Org Admin:** Manages the entire business. Creates outlets, enters total 
  daily stock, and sets prices.
- **Outlet Manager:** Oversees one specific branch. Views live sales and 
  table status.
- **Outlet Staff:** Fast-access POS user. Takes orders, manages tables, 
  and marks bills as paid.

## 3. Core Features (MVP)
### A. The Dashboard (Admin)
- **Stock Distribution:** A simple screen to assign "60 Mathi" to different outlets.
- **Freshness Alerts:** Visual color codes (Green/Yellow/Red) showing how many 
  days old a specific batch of stock is.
- **Outlet Management:** Simple CRUD to add new branch locations.

### B. The POS Screen (Staff)
- **Live Table Grid:** Visual map of tables.
  - **Grey:** Empty.
  - **Orange:** Someone is currently picking items (Real-time sync).
  - **Red:** Occupied/Food served.
- **Simple Menu:** Large buttons for dishes. Buttons show "Remaining Stock" 
  count in real-time.
- **Stock Reservation:** Items are deducted from the outlet's live count 
  only when "Proceed" is clicked.

## 4. How Data Flows
1. **Admin Entry:** Admin adds 100 items -> Saved to `menu_items`.
2. **Transfer:** Admin sends 20 to Outlet A -> Creates a row in `outlet_inventory`.
3. **Ordering:** Staff selects Table 5 -> Table status becomes `ordering` (Supabase Realtime).
4. **Checkout:** Staff hits "Paid" -> Table becomes `available`, `outlet_inventory` 
   decreases, and an `order` record is created.

## 5. UI/UX Principles
- **Minimalist:** No cluttered menus.
- **Color Indicators:** Use colors for status (stock age, table occupancy).
- **Mobile First:** The POS must work perfectly on a tablet or phone.