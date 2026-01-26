import { CreateOutletDialog } from "@/components/admin/CreateOutletDialog"
import { OutletCard } from "@/components/admin/OutletCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { MapPin, Store } from "lucide-react"
import { Database } from '@/types/database.types'

type Outlet = Database['public']['Tables']['outlets']['Row']

export default async function OutletsPage() {
    const supabase = await createClient()

    const { data: outlets } = await supabase
        .from('outlets')
        .select('*')
        .order('created_at', { ascending: false })

    const refreshOutlets = async () => {
        'use server'
        // This function will be called from client components to trigger a refresh
        // The actual refresh happens via router.refresh() in the client components
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manage Outlets</h2>
                    <p className="text-muted-foreground">View and manage all your restaurant outlets.</p>
                </div>
                <CreateOutletDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {outlets?.map((outlet) => (
                    <OutletCard 
                        key={outlet.id} 
                        outlet={outlet} 
                        onUpdate={refreshOutlets}
                    />
                ))}

                {(!outlets || outlets.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-card text-muted-foreground">
                        <Store className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No outlets found</h3>
                        <p>Create your first outlet to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}