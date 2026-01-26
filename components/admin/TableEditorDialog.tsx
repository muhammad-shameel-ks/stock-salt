'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'

type Outlet = Database['public']['Tables']['outlets']['Row']
type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row']

interface TableEditorDialogProps {
    outlet: Outlet
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function TableEditorDialog({ outlet, open, onOpenChange, onUpdate }: TableEditorDialogProps) {
    const [tables, setTables] = useState<RestaurantTable[]>([])
    const [newTableNumber, setNewTableNumber] = useState('')
    const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null)
    const [editTableNumber, setEditTableNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const fetchTables = async () => {
        try {
            const { data, error } = await supabase
                .from('restaurant_tables')
                .select('*')
                .eq('outlet_id', outlet.id)
                .order('table_number', { ascending: true })

            if (error) throw error
            setTables(data || [])
        } catch (error) {
            console.error('Error fetching tables:', error)
        }
    }

    useEffect(() => {
        if (open && outlet.id) {
            fetchTables()
        }
    }, [open, outlet.id])

    const handleAddTable = async () => {
        if (!newTableNumber.trim()) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('restaurant_tables')
                .insert({
                    outlet_id: outlet.id,
                    table_number: newTableNumber.trim(),
                    status: 'available'
                })

            if (error) throw error

            setNewTableNumber('')
            fetchTables()
        } catch (error) {
            console.error('Error adding table:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateTable = async (table: RestaurantTable) => {
        if (!editTableNumber.trim()) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('restaurant_tables')
                .update({
                    table_number: editTableNumber.trim()
                })
                .eq('id', table.id)

            if (error) throw error

            setEditingTable(null)
            fetchTables()
        } catch (error) {
            console.error('Error updating table:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTable = async (tableId: string) => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('restaurant_tables')
                .delete()
                .eq('id', tableId)

            if (error) throw error

            fetchTables()
        } catch (error) {
            console.error('Error deleting table:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTableSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleAddTable()
    }

    const handleEditTableSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingTable) {
            handleUpdateTable(editingTable)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800'
            case 'ordering':
                return 'bg-yellow-100 text-yellow-800'
            case 'occupied':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Tables - {outlet.name}</DialogTitle>
                    <DialogDescription>
                        Add, edit, or remove restaurant tables for this outlet.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Add New Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Table</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddTableSubmit} className="flex gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Table number (e.g., 1, 2, 3)"
                                    value={newTableNumber}
                                    onChange={(e) => setNewTableNumber(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={loading || !newTableNumber.trim()}>
                                    <Plus className="h-4 w-4" />
                                    Add
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Existing Tables */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Existing Tables ({tables.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tables.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No tables found. Add your first table above.
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {tables.map((table) => (
                                        <div key={table.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            {editingTable?.id === table.id ? (
                                                <form onSubmit={handleEditTableSubmit} className="flex gap-2 flex-1">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={editTableNumber}
                                                        onChange={(e) => setEditTableNumber(e.target.value)}
                                                        placeholder="Table number"
                                                        className="flex-1"
                                                    />
                                                    <Button type="submit" size="sm" disabled={loading}>
                                                        Save
                                                    </Button>
                                                    <Button 
                                                        type="button" 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingTable(null)
                                                            setEditTableNumber('')
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium">Table {table.table_number}</span>
                                                        <Badge variant="secondary" className={getStatusColor(table.status || 'available')}>
                                                            {table.status || 'available'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingTable(table)
                                                                setEditTableNumber(table.table_number.toString())
                                                            }}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteTable(table.id)}
                                                            disabled={loading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            onOpenChange(false)
                            onUpdate()
                        }}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}