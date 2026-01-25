import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role === 'admin') {
        redirect('/dashboard/admin')
    } else if (profile?.role === 'staff') {
        redirect('/dashboard/pos')
    } else {
        // Fallback or setup screen
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Welcome!</h2>
                    <p className="text-muted-foreground">Please contact an admin to assign a role.</p>
                </div>
            </div>
        )
    }
}
