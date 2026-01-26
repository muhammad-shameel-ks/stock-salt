import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuToggle } from "@/components/layout/mobile-menu-toggle";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to get role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as "admin" | "staff" | undefined;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AppSidebar role={role} />
      <main className="flex-1 overflow-y-auto bg-secondary/10 p-4 md:p-8 relative">
        {/* Mobile menu button */}
        <div className="md:hidden absolute top-4 left-4 z-20">
          <button
            id="mobile-menu-button"
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Subtle background pattern/gradient for content area */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)] -z-10" />
        {children}
        <MobileMenuToggle />
      </main>

      {/* Overlay for mobile sidebar */}
      <div
        id="sidebar-overlay"
        className="fixed inset-0 bg-black/50 z-20 hidden md:hidden pointer-events-none opacity-0 transition-opacity"
      ></div>
    </div>
  );
}
