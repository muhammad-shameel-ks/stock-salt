"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/contexts/session-context";
import { 
  ArrowRight, 
  BarChart3, 
  Clock, 
  CreditCard, 
  Layers, 
  Store, 
  Zap, 
  ShieldCheck, 
  Smartphone 
} from "lucide-react";

export default function LandingPage() {
  const { user } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Glassmorphic Nav Bar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[95%] max-w-5xl px-4 py-3 rounded-full bg-background/40 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10 transition-all duration-300">
        <div className="flex items-center gap-2 pl-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-black italic tracking-tighter text-xl uppercase drop-shadow-sm">StockSalt</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#platform" className="hover:text-primary transition-colors">Platform</Link>
          <Link href="#security" className="hover:text-primary transition-colors">Security</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pr-1">
          {user ? (
            <Link href="/dashboard">
              <Button className="rounded-full px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                Command Center <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="rounded-full px-6 font-bold uppercase tracking-widest hover:bg-muted/50">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full px-6 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Beta/Promotional Banner */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl">
        <div className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 backdrop-blur-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
            <span className="uppercase tracking-widest">Beta Launch</span> — Signups are completely free for testing. No credit card required.
          </p>
          <Link href="/signup">
            <Button size="sm" className="rounded-full px-4 h-8 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black uppercase text-xs tracking-widest shadow-md">
              Try Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 flex flex-col items-center justify-center text-center">
        <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-primary/30 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Zap className="h-3 w-3 mr-2 inline-block" /> The Ultimate Restaurant OS
        </Badge>
        
        <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          Command your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-primary/40">
            entire network
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground font-medium mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Real-time analytics, live stock tracking, and lightning-fast billing. 
          Unify your multi-outlet restaurant management into one beautiful, insanely powerful dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-8 h-14 text-base font-black uppercase tracking-widest shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
                Enter Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 h-14 text-base font-black uppercase tracking-widest shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
                  Start Building Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-black uppercase tracking-widest border-2 hover:bg-muted/50 transition-all">
                  Live Demo
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 3D Dashboard Mockup Presentation */}
        <div className="mt-20 md:mt-32 w-full max-w-6xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 perspective-[2000px]">
          <div className="relative rounded-[2rem] border border-border/50 bg-background/50 backdrop-blur-3xl shadow-2xl overflow-hidden transform-gpu rotate-x-[5deg] scale-95 md:scale-100 transition-transform duration-700 hover:rotate-x-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10 pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
              alt="Dashboard Preview" 
              className="w-full h-auto object-cover opacity-80"
            />
            
            {/* Overlay UI Elements to simulate app */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[90%] md:w-[80%] aspect-video bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 hidden md:flex flex-col gap-4">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-primary/20 rounded animate-pulse" />
                  <div className="h-8 w-48 bg-foreground/10 rounded" />
                </div>
                <div className="h-10 w-32 rounded-full bg-primary/10 border border-primary/20" />
              </div>
              <div className="grid grid-cols-3 gap-4 h-32">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-xl bg-muted/40 border border-border/50 p-4 space-y-2">
                    <div className="h-3 w-16 bg-foreground/20 rounded" />
                    <div className="h-6 w-24 bg-foreground/40 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex-1 rounded-xl bg-muted/40 border border-border/50 mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Extreme Performance</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Everything you need to scale your restaurant operations, baked into a system designed for speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Feature 1 */}
          <div className="md:col-span-2 rounded-[2.5rem] p-8 border border-border/50 bg-gradient-to-br from-card to-muted/20 hover:border-primary/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors" />
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3">Real-time Pulse</h3>
            <p className="text-muted-foreground font-medium max-w-md">
              Watch transactions flow in instantly across all branches. Our realtime command center syncs instantly—no refreshing required.
            </p>
            <div className="mt-8 flex gap-3">
              <Badge variant="secondary" className="font-bold">Socket Sync</Badge>
              <Badge variant="secondary" className="font-bold">Live Metrics</Badge>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-[2.5rem] p-8 border border-border/50 bg-card hover:border-primary/30 transition-colors group">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3">Multi-Outlet</h3>
            <p className="text-muted-foreground font-medium text-sm">
              Manage dozens of locations effortlessly. Compare performance, track individual outlet sales, and rank your top performers on the fly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-[2.5rem] p-8 border border-border/50 bg-card hover:border-primary/30 transition-colors group">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3">Live Stock</h3>
            <p className="text-muted-foreground font-medium text-sm">
              Track exactly what was sent, what was sold, and what&apos;s remaining at every single outlet right now. Zero discrepancies.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-2 rounded-[2.5rem] p-8 border border-border/50 bg-gradient-to-bl from-card to-muted/20 hover:border-primary/30 transition-colors group relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3">Instant Billing</h3>
              <p className="text-muted-foreground font-medium">
                Split payments between Cash and UPI automatically. Our point-of-sale interface is built for high-speed counter operations.
              </p>
            </div>
            <div className="w-full md:w-64 h-full min-h-[160px] rounded-2xl bg-background border border-border shadow-inner p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                <span className="font-bold text-xs uppercase">UPI</span>
                <span className="font-black italic">₹12,450</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                <span className="font-bold text-xs uppercase">CASH</span>
                <span className="font-black italic">₹8,920</span>
              </div>
              <div className="mt-auto flex justify-between items-center px-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                <span className="font-black text-primary italic">₹21,370</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section id="security" className="py-24 border-y border-border/50 bg-muted/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-background border border-border shadow-sm flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Enterprise Grade</h4>
              <p className="text-muted-foreground text-sm font-medium">Built on Supabase and Next.js for reliable, secure, and scalable infrastructure.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-background border border-border shadow-sm flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Mobile Ready</h4>
              <p className="text-muted-foreground text-sm font-medium">Manage your outlets from anywhere. Fully responsive dashboard designed for any screen.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-background border border-border shadow-sm flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Zero Latency</h4>
              <p className="text-muted-foreground text-sm font-medium">Optimized for extreme performance. Your metrics update the millisecond a sale happens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 z-[-1]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]" />
        </div>
        
        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6">
          Ready to take control?
        </h2>
        <p className="text-xl text-muted-foreground font-medium mb-10 max-w-xl">
          Join the modern standard for restaurant management. Sign up now and deploy to your first outlet in minutes.
        </p>
        <Link href="/signup">
          <Button size="lg" className="rounded-full px-12 h-16 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-transform hover:scale-110">
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <span className="font-black italic tracking-tighter text-xl uppercase">StockSalt</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            © {new Date().getFullYear()} StockSalt Systems. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
