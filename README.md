# 🧂 Stock Salt

> A real-time multi-outlet retail management platform with live inventory tracking, POS terminals, and comprehensive analytics.

Stock Salt is a complete business management solution designed for businesses with multiple retail outlets. It provides real-time visibility into sales, inventory distribution, and revenue metrics across all your branches from a single dashboard.



---

## ✨ What Does Stock Salt Do?

**In simple terms:** Stock Salt helps you manage your retail business by tracking every item from your central warehouse to your customers' hands.

### The Core Problem It Solves

Imagine you run a chain of food stalls or retail outlets. You need to:

- 📦 Know how much stock you have at your main warehouse each morning
- 🚚 Distribute items to different outlets
- 💰 Track sales at each location in real-time
- 📊 See which outlet is performing best today
- 🔄 Prevent selling items you don't have

**Stock Salt handles all of this automatically.**

---

## 🚀 Key Features

### 🖥️ Command Center Dashboard
- **Real-time Revenue Tracking** - Watch today's sales flow in live
- **Live Transaction Stream** - See every sale as it happens with full details
- **Hourly Revenue Charts** - Visualize sales momentum throughout the day
- **Outlet Rankings** - Compare performance across all branches instantly
- **Payment Analytics** - UPI vs Cash breakdown with totals

### 📦 Smart Stock Management
- **Master Stock Setup** - Define daily inventory at your hub/warehouse
- **Smart Distribution** - Allocate items to outlets with availability checks
- **Live Ground Tracking** - Watch inventory deplete in real-time at each outlet
- **Automatic Deductions** - Sales automatically reduce outlet stock
- **Price Fluctuation Support** - Handle market-priced items with daily pricing

### 🛒 Point of Sale (POS) Terminal
- **Quick Order Entry** - Fast interface for cashiers
- **Category Filtering** - Find products instantly
- **Live Stock Warnings** - Prevent overselling with real-time inventory
- **Multiple Payment Methods** - Support for UPI, Cash, and more
- **Transaction Receipts** - Complete bills with all details

### 👥 Multi-User Access Control
- **Admin** - Full access to all features, settings, and analytics
- **Manager** - POS access plus local outlet management
- **Staff** - Basic dashboard view for monitoring
- **Role-Based Redirects** - Users go to their appropriate dashboard automatically

### 📈 Reports & Analytics
- **Daily Sales Reports** - Complete transaction history
- **Revenue Momentum** - Hourly/daily trends
- **Outlet Performance** - Ranked comparisons
- **Inventory Breakdown** - Item-level stock tracking

### 🔔 Real-Time Everything
- Live updates via Supabase Realtime
- Instant stock synchronization across all outlets
- Price changes broadcast immediately to POS terminals
- No page refresh required

---

## 👤 User Roles & Access

| Role | What They Can Do | Dashboard |
|------|------------------|-----------|
| **Admin** | Manage outlets, menu, stock distribution, users, view all analytics | `/dashboard` |
| **Manager** | Process sales at their outlet, view outlet performance | `/manager` |
| **Staff** | Monitor daily metrics (read-only) | `/staff` or `/dashboard` |

### How Role-Based Access Works

1. User signs up or logs in
2. System checks their role from the database
3. Middleware redirects them to their appropriate dashboard
4. Sidebar navigation shows only relevant options for their role

---

## 🏗️ How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    MORNING WORKFLOW                              │
└─────────────────────────────────────────────────────────────────┘

   CENTRAL HUB              DISTRIBUTION               OUTLETS
   ┌──────────┐            ┌──────────┐            ┌──────────┐
   │  MASTER  │───────────▶│  DISTRIB │───────────▶│   POS    │
   │  STOCK   │   allocate │  STOCK   │   receive  │ TERMINAL │
   │  SETUP   │            │  PANEL   │            │          │
   └──────────┘            └──────────┘            └──────────┘
        │                        │                      │
        │                        │                      ▼
        │                        │            ┌──────────────┐
        │                        │            │   SALES      │
        │                        │            │   TRACKING   │
        │                        │            └──────────────┘
        │                        │                      │
        │                        │                      ▼
        │                        │            ┌──────────────┐
        │                        │            │  REAL-TIME   │
        │◀───────────────────────└────────────│  UPDATES    │
                    live sync                  └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    COMMAND CENTER                                │
└─────────────────────────────────────────────────────────────────┘

   All data flows in real-time to the Admin Dashboard:
   • Revenue calculations (UPI + Cash)
   • Transaction log with full details
   • Outlet performance rankings
   • Inventory levels per item per outlet
   • Hourly sales charts
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16 | React framework with App Router |
| **Language** | TypeScript 5 | Type-safe JavaScript |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **UI Components** | Radix UI + shadcn/ui | Accessible component primitives |
| **Database & Auth** | Supabase | PostgreSQL, Realtime, Authentication |
| **Charts** | Recharts | Beautiful, responsive charts |
| **Forms** | Zod + React Hook Form | Schema validation |
| **Icons** | Lucide + Tabler | Beautiful icon sets |
| **State Management** | React Context + Hooks | Built-in React patterns |
| **Notifications** | Sonner | Toast notifications |

---

## 📁 Project Structure

```
stock-salt/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Admin command center
│   ├── manager/          # Manager POS terminal
│   ├── stocks/           # Stock hub & distribution
│   ├── menu/             # Product/menu management
│   ├── outlets/          # Outlet management
│   ├── users/            # User management
│   ├── reports/          # Sales reports
│   ├── settings/         # App settings
│   ├── login/            # Authentication
│   └── signup/           # New user registration
├── components/           # React components
│   ├── ui/              # Base UI components (shadcn)
│   ├── app-sidebar.tsx   # Navigation sidebar
│   ├── site-header.tsx   # Top header bar
│   ├── stock-counter.tsx # Stock input controls
│   └── ...              # Feature-specific components
├── contexts/             # React Context providers
│   └── session-context.tsx  # Auth session management
├── lib/                  # Utilities & configs
│   ├── supabase/        # Supabase client setup
│   └── utils.ts         # Helper functions
├── hooks/               # Custom React hooks
├── middleware.ts        # Auth middleware & routing
└── package.json        # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher - [Download here](https://nodejs.org)
- **npm**, **yarn**, **pnpm**, or **bun** (package managers)
- **Supabase Account** - Free tier works perfectly

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-salt.git
   cd stock-salt
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Or using pnpm
   pnpm install

   # Or using yarn
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up your Supabase database**
   
   Run the migrations in your Supabase SQL editor:
   - Create tables: `profiles`, `organizations`, `outlets`, `menu_items`, `master_stocks`, `daily_stocks`, `transactions`, `transaction_items`
   - Set up Row Level Security (RLS) policies
   - Enable Realtime for relevant tables

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Database Schema Overview

```
organizations          # Each business/company
├── profiles          # Users with roles (admin, manager, staff)
├── outlets          # Physical locations/branches
├── menu_items       # Products for sale
├── master_stocks    # Daily inventory at hub (per date)
├── daily_stocks     # Inventory allocated to outlets (per date)
├── transactions     # Sales transactions
└── transaction_items  # Individual items in each sale
```

### Key Tables

| Table | Description |
|-------|-------------|
| `organizations` | Multi-tenant business accounts |
| `profiles` | User accounts with roles and org_id |
| `outlets` | Physical store locations |
| `menu_items` | Products with pricing and categories |
| `master_stocks` | Central hub inventory per day |
| `daily_stocks` | Outlet-specific inventory per day |
| `transactions` | Sale records with totals |
| `transaction_items` | Line items within transactions |

---

## 📱 Screenshots

### Command Center Dashboard
Real-time analytics with live transaction stream and outlet rankings.

### Stock Hub
Centralized stock management with distribution to multiple outlets.

### POS Terminal
Fast, intuitive point-of-sale interface for cashiers.

---

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🔐 Authentication Flow

1. **User visits app** → Redirected to `/login` if not authenticated
2. **User signs up/logs in** → Supabase Auth handles credentials
3. **Session created** → React Context stores user info
4. **Middleware checks role** → Redirects to appropriate dashboard
5. **Sidebar adapts** → Shows only role-relevant navigation

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Docker

```dockerfile
# Build image
docker build -t stock-salt .

# Run container
docker run -p 3000:3000 stock-salt
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- [Recharts](https://recharts.org/) - Composable charting library

---

## 📞 Support

If you have questions or need help:

- 📧 Email: muhammadshameelks@gmail.com
- 💬 GitHub Issues: [Report a bug](https://github.com/muhammad-shameel-ks/stock-salt/issues)
- 📖 Docs: Check the `/docs` folder in the repository

---

**Built with ❤️ by the Stock Salt Team**

> *"Simplifying retail management, one transaction at a time."*
