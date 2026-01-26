# Project Overview: Stock Management System (Food & Restaurant)

## 1. System Concept

A hierarchical stock management application designed for a food service environment where an Admin manages global inventory and distributes specific stock to multiple users who record sales in real-time.

## 2. User Roles & Capabilities

### **Admin (Web Dashboard)**

- **Database Setup:** Initialize the product list including fixed-price items (meals, standard curries) and variable-price items (seasonal fish).
- **Dynamic Pricing:** Ability to update "Market Prices" for variable items daily before assigning them to users.
- **Stock Allocation:** Assign specific quantities of items to 5–10 individual sub-users.
- **Real-time Oversight:** Monitor the live sales data and remaining balance across all user accounts.
- **Reporting:** Generate daily or weekly summaries of stock movement and revenue.

### **Users (Mobile Web App)**

- **Secure Authentication:** Unique login/password for each user to ensure data privacy.
- **Personalized View:** Users only see the stock items and quantities assigned to them by the Admin.
- **Sales Recording:** A simplified interface to record sales, which automatically deducts from their assigned balance.

## 3. Inventory Types

| Item Category      | Description                                                 | Example                                   |
| :----------------- | :---------------------------------------------------------- | :---------------------------------------- |
| **Fixed Price**    | Prices remain constant; set during database initialization. | Meals, Squid, Prawns, Small Fish          |
| **Variable Price** | Prices fluctuate daily; Admin updates these manually.       | Pearl Spot (Karimeen), Tilapia, Chemballi |

## 4. Modern Tech Stack (Next.js Roadmap)

### **Frontend & UI (Mobile-First)**

- **Framework:** Next.js 15+ (App Router) for high performance and SEO.
- **Styling:** Tailwind CSS for a fully responsive, mobile-first utility design.
- **Components:** Shadcn/UI using "Bottom Sheets" instead of modals for a native mobile feel.
- **State Management:** TanStack Query (React Query) for optimistic UI updates (sales reflect instantly).

### **Backend & Database**

- **Auth:** NextAuth.js (Auth.js) for secure, session-based user management.
- **Database:** PostgreSQL (hosted on Vercel or Supabase).
- **ORM:** Prisma or Drizzle for type-safe database queries.
- **Real-time:** Supabase Realtime or Pusher to sync Admin views immediately when a User records a sale.

## 5. Development Phases

1.  **Skeleton Phase:** Build the core database schema and Admin/User authentication.
2.  **Allocation Phase:** Implement the logic for Admin to push stock to specific User buckets.
3.  **Sales & Sync:** Develop the mobile UI for users to "cut off" (deduct) stock during sales.
4.  **Reporting Phase:** Build the Admin dashboard for total balance and historical data tracking.
