# stock-salt

This is a Next.js project bootstrapped with create-next-app. It uses the App Router and Next/font to load Geist, a UI font from Vercel.

## Getting Started

Prerequisites

- Node.js is required. Install it from https://nodejs.org
- A package manager (npm, yarn, pnpm, or bun)

Install

- Run one of the following commands to install dependencies:
  - npm install
  - yarn install
  - pnpm i
  - bun install

Development

- Start the development server:
  - npm run dev
  - yarn dev
  - pnpm dev
  - bun dev
- Open http://localhost:3000 in your browser to see the app.
- You can edit app/page.tsx; changes hot-reload automatically.

Build for production

- To build:
  - npm run build
  - yarn build
  - pnpm build
  - bun build
- To run the production server after building:
  - npm run start
  - yarn start
  - pnpm start

Fonts

- This project uses next/font to optimize and load Geist font.

## Features
- Real-time, multi-outlet inventory and analytics dashboard with live metrics (revenue, orders, stock)
- Live transaction stream with per-transaction detail and on-demand billing details
- Master stock management: define daily master stock per item with optional daily pricing
- Distribution workflow: allocate master stock to outlets and monitor live stock levels
- Live inventory breakdown by item/outlet, including distribution logs
- Outlet rankings and revenue momentum charts for quick insights
- Admin controls with a dedicated Danger Zone safeguarded by confirmation dialogs
- Role-based access controls for admin vs standard users
- Rich, card-based UI with gradients, icons, and responsive design
- Real-time data flow using Supabase channels to refresh dashboards on data changes

Learn More

- Next.js Documentation: https://nextjs.org/docs
- Learn Next.js: https://nextjs.org/learn
- Next.js GitHub: https://github.com/vercel/next.js

Deploy on Vercel

- The easiest way to deploy is through the Vercel platform:
  https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme
- See Next.js deployment docs for more details:
  https://nextjs.org/docs/app/building-your-application/deploying
