"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "../ui/badge"

const stats = [
  { title: "Win Rate", value: "65%", trend: "+2%", trendDirection: "up" },
  { title: "Total Trades", value: "124", trend: "+10", trendDirection: "up" },
  { title: "Avg. R/R Ratio", value: "2.1:1", trend: "-0.2", trendDirection: "down" },
  { title: "Avg. Duration", value: "4h 15m", trend: "+30m", trendDirection: "up" },
  { title: "Best Pair", value: "EUR/USD", trend: "+$500", trendDirection: "up" },
];

export function QuickStatsCard() {
  return (
    <Carousel opts={{
      align: "start",
      loop: true,
    }} className="w-full">
      <CarouselContent>
        {stats.map((stat, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">
                    <Badge variant={stat.trendDirection === 'up' ? 'default' : 'destructive'} className={`${stat.trendDirection === 'up' ? 'bg-accent text-accent-foreground' : ''}`}>
                      {stat.trendDirection === 'up' ? '↑' : '↓'} {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  )
}
