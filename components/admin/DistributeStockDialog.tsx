'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DistributeStockDialogProps {
    item: { id: string; name: string }
    outlets: { id: string; name: string }[]
}

export function DistributeStockDialog({ item, outlets }: DistributeStockDialogProps) {
    const [open, setOpen] = useState(false)
    const [outletId, setOutletId] = useState('')
    const [quantity, setQuantity] = useState('')
    const [batchId, setBatchId] = useState('') // Optional: Auto-generate or manual? Manual for now for tracking
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!outletId || !quantity) return

            // Simple insert for now. In real app, might want to check existing batch or sum up.
            // Plan says: "Creates a row in outlet_inventory"
            const { error } = await supabase.from('outlet_inventory').insert({
                outlet_id: outletId,
                item_id: item.id,
                quantity: parseInt(quantity),
                batch_id: batchId || `BATCH-${Date.now().toString().slice(-6)}` // Auto-gen if empty
            })

            if (error) throw error

            setOpen(false)
            setQuantity('')
            setBatchId('')
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Distribute
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Distribute Stock</DialogTitle>
                        <DialogDescription>
                            Send <strong>{item.name}</strong> to an outlet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="outlet" className="text-right">
                                Outlet
                            </Label>
                            <Select onValueChange={setOutletId} required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select outlet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {outlets.map((outlet) => (
                                        <SelectItem key={outlet.id} value={outlet.id}>
                                            {outlet.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">
                                Qty
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="col-span-3"
                                placeholder="Amount"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batch" className="text-right">
                                Batch ID
                            </Label>
                            <Input
                                id="batch"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                className="col-span-3"
                                placeholder="Optional (Auto-generated)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Confirm Transfer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
