'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Store, Edit2, TableProperties } from 'lucide-react'
import { EditOutletDialog } from './EditOutletDialog'
import { TableEditorDialog } from './TableEditorDialog'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Outlet = Database['public']['Tables']['outlets']['Row']
type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row']

interface OutletCardProps {
    outlet: Outlet
    onUpdate: () => void
}

export function OutletCard({ outlet, onUpdate }: OutletCardProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [tableDialogOpen, setTableDialogOpen] = useState(false)
    const [tables, setTables] = useState<RestaurantTable[]>([])
    const supabase = createClient()

    const fetchTables = async () => {
        try {
            const { data, error } = await supabase
                .from('restaurant_tables')
                .select('*')
                .eq('outlet_id', outlet.id)

            if (error) throw error
            setTables(data || [])
        } catch (error) {
            console.error('Error fetching tables:', error)
        }
    }

    useEffect(() => {
        fetchTables()
    }, [outlet.id])

    const availableTables = tables.filter(t => t.status === 'available').length
    const occupiedTables = tables.filter(t => t.status === 'occupied').length
    const orderingTables = tables.filter(t => t.status === 'ordering').length

    return (
        <>
            <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">{outlet.name}</CardTitle>
                    <Store className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        {outlet.location || 'No location set'}
                    </div>

                    {/* Tables Status */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Tables</span>
                            <Badge variant="secondary">
                                {tables.length} total
                            </Badge>
                        </div>
                        <div className="flex gap-2 text-xs">
                            {availableTables > 0 && (
                                <Badge className="bg-green-100 text-green-800">
                                    {availableTables} Available
                                </Badge>
                            )}
                            {orderingTables > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                    {orderingTables} Ordering
                                </Badge>
                            )}
                            {occupiedTables > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                    {occupiedTables} Occupied
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                            Active
                        </span>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTableDialogOpen(true)}
                            >
                                <TableProperties className="h-4 w-4 mr-1" />
                                Tables
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditDialogOpen(true)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <EditOutletDialog
                outlet={outlet}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onUpdate={() => {
                    onUpdate()
                }}
            />

            {/* Table Editor Dialog */}
            <TableEditorDialog
                outlet={outlet}
                open={tableDialogOpen}
                onOpenChange={setTableDialogOpen}
                onUpdate={() => {
                    fetchTables()
                    onUpdate()
                }}
            />
        </>
    )
}