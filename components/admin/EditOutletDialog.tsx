'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'

type Outlet = Database['public']['Tables']['outlets']['Row']

interface EditOutletDialogProps {
    outlet: Outlet
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function EditOutletDialog({ outlet, open, onOpenChange, onUpdate }: EditOutletDialogProps) {
    const [name, setName] = useState(outlet.name)
    const [location, setLocation] = useState(outlet.location || '')
    const [tableCount, setTableCount] = useState(outlet.table_count || 10)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('outlets')
                .update({
                    name,
                    location,
                    table_count: tableCount
                })
                .eq('id', outlet.id)

            if (error) throw error

            onOpenChange(false)
            onUpdate()
            router.refresh()
        } catch (error) {
            console.error('Error updating outlet:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setName(outlet.name)
        setLocation(outlet.location || '')
        setTableCount(outlet.table_count || 10)
    }

    useEffect(() => {
        if (open) {
            resetForm()
        }
    }, [open, outlet])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Outlet</DialogTitle>
                        <DialogDescription>
                            Update outlet information and table count.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Downtown Branch"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. 123 Main St"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tableCount" className="text-right">
                                Tables
                            </Label>
                            <Input
                                id="tableCount"
                                type="number"
                                min="1"
                                max="100"
                                value={tableCount}
                                onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                                className="col-span-3"
                                placeholder="Number of tables"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Outlet'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}