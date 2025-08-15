"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const hours = Array.from({ length: 24 }, (_, i) => i);
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const mockHeatmapData: Record<string, { pnl: number, trades: number }> = {
    "1-2": { pnl: 50, trades: 2 },
    "1-3": { pnl: -30, trades: 1 },
    "2-8": { pnl: 120, trades: 3 },
    "2-9": { pnl: 80, trades: 1 },
    "3-14": { pnl: 250, trades: 4 },
    "3-15": { pnl: -100, trades: 2 },
    "4-16": { pnl: 300, trades: 2 },
};

const getColorClass = (pnl: number | undefined) => {
    if (pnl === undefined) return "bg-muted/40 hover:bg-muted";
    if (pnl > 200) return "bg-accent/100 hover:bg-accent/90";
    if (pnl > 0) return "bg-accent/60 hover:bg-accent/50";
    if (pnl < -100) return "bg-destructive/90 hover:bg-destructive/80";
    if (pnl < 0) return "bg-destructive/60 hover:bg-destructive/50";
    return "bg-muted/40 hover:bg-muted";
}


export function SessionHeatmap() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Profitability Heatmap</CardTitle>
                <CardDescription>Your most profitable times of the week (IST).</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                        <div className="grid grid-rows-7 gap-1 text-xs text-muted-foreground mt-8">
                            {days.map(day => <div key={day} className="h-8 flex items-center">{day}</div>)}
                        </div>
                        <div className="overflow-x-auto">
                            <div className="grid grid-rows-[auto_1fr] gap-2">
                                <div className="grid grid-cols-24 gap-1 text-xs text-muted-foreground">
                                    {hours.map(hour => <div key={hour} className="w-8 text-center">{String(hour).padStart(2, '0')}</div>)}
                                </div>
                                <div className="grid grid-rows-7 grid-flow-col gap-1">
                                    {days.map((day, dayIndex) => (
                                        <React.Fragment key={day}>
                                            {hours.map(hour => {
                                                const data = mockHeatmapData[`${dayIndex}-${hour}`];
                                                return (
                                                    <Tooltip key={`${day}-${hour}`}>
                                                        <TooltipTrigger asChild>
                                                            <div className={cn("w-8 h-8 rounded-sm cursor-pointer transition-colors", getColorClass(data?.pnl))} />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="font-semibold">{day}, {String(hour).padStart(2, '0')}:00</p>
                                                            {data ? (
                                                                <>
                                                                    <p>PNL: ${data.pnl.toFixed(2)}</p>
                                                                    <p>Trades: {data.trades}</p>
                                                                </>
                                                            ) : (
                                                                <p>No trades</p>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
