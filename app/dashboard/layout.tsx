import { AppSidebar } from '@/components/layout/app-sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile to get role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role as 'admin' | 'staff' | undefined

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <AppSidebar role={role} />
            <main className="flex-1 overflow-y-auto bg-secondary/10 p-4 md:p-8 relative">
                {/* Subtle background pattern/gradient for content area */}
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)] -z-10" />
                {children}
            </main>
        </div>
    )
}
