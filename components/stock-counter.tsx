"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StockCounterProps {
    value: number;
    onChange: (value: number) => void;
    unit?: string;
    className?: string;
    min?: number;
    max?: number;
}

export function StockCounter({
    value,
    onChange,
    unit,
    className,
    min = 0,
    max = Infinity,
}: StockCounterProps) {
    const handleIncrement = () => {
        if (value < max) {
            onChange(Number((value + 1).toFixed(2)));
        }
    };

    const handleDecrement = () => {
        if (value > min) {
            onChange(Number((value - 1).toFixed(2)));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            onChange(val);
        } else if (e.target.value === "") {
            onChange(0);
        }
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full active:scale-95 transition-transform"
                onClick={handleDecrement}
                disabled={value <= min}
                type="button"
            >
                <Minus className="h-4 w-4" />
            </Button>

            <div className="relative flex-1 min-w-[80px]">
                <Input
                    type="number"
                    value={value === 0 ? "" : value}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="h-10 text-center font-semibold text-lg pr-8"
                />
                {unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground uppercase font-bold pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>

            <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full active:scale-95 transition-transform bg-primary/5 hover:bg-primary/10 border-primary/20"
                onClick={handleIncrement}
                type="button"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
