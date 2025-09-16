
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { mistakeTags } from "@/lib/data";
import type { Trade, Session } from "@/lib/types";
import { useTrades } from "@/context/trade-provider";

const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  type: z.enum(["buy", "sell"]),
  opening_price: z.coerce.number().positive("Opening price must be positive."),
  closing_price: z.coerce.number().positive("Closing price must be positive."),
  lots: z.coerce.number().positive("Lots must be positive."),
  stop_loss: z.coerce.number().min(0, "Stop loss must be a non-negative number."),
  take_profit: z.coerce.number().min(0, "Take profit must be a non-negative number."),
  commission_usd: z.coerce.number().min(0, "Commission cannot be negative.").optional().default(0),
  swap_usd: z.coerce.number().min(0, "Swap cannot be negative.").optional().default(0),
  notes: z.string().optional(),
  mistakes: z.array(z.string()).optional(),
  chartUrl: z.any().optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

const getSession = (date: Date): Session => {
    const hour = date.getUTCHours();
    if (hour >= 0 && hour < 8) return "Asian";
    if (hour >= 7 && hour < 16) return "London";
    if (hour >= 12 && hour < 21) return "New York";
    return "London";
};


export function EditTradeDialog({ children, trade }: { children: React.ReactNode, trade: Trade }) {
  const [open, setOpen] = React.useState(false);
  const [selectedMistakes, setSelectedMistakes] = React.useState<string[]>(trade.mistakes || []);
  const [chartPreview, setChartPreview] = React.useState<string | null>(trade.chartUrl || null);
  const { toast } = useToast();
  const { updateTrade } = useTrades();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: trade.symbol || "",
      type: trade.type || "buy",
      opening_price: trade.opening_price || 0,
      closing_price: trade.closing_price || 0,
      lots: trade.lots || 0,
      stop_loss: trade.stop_loss || 0,
      take_profit: trade.take_profit || 0,
      commission_usd: trade.commission_usd || 0,
      swap_usd: trade.swap_usd || 0,
      notes: trade.notes || "",
      mistakes: trade.mistakes || [],
      chartUrl: trade.chartUrl || null
    },
  });
  
  const handleMistakeToggle = (mistake: string) => {
    setSelectedMistakes(prev => 
      prev.includes(mistake) ? prev.filter(m => m !== mistake) : [...prev, mistake]
    );
  };
  
  React.useEffect(() => {
    form.setValue("mistakes", selectedMistakes);
  }, [selectedMistakes, form]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setChartPreview(result);
        form.setValue("chartUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: TradeFormValues) => {
    const isBuy = data.type === 'buy';
    const contractSize = 100000;

    const pipValue = data.symbol.toLowerCase().includes('jpy') ? 0.01 : 0.0001;
    const pips = (isBuy ? data.closing_price - data.opening_price : data.opening_price - data.closing_price) / pipValue;
    
    const priceDifference = isBuy ? data.closing_price - data.opening_price : data.opening_price - data.closing_price;
    const profit_usd = (priceDifference * contractSize * data.lots) - (data.commission_usd || 0) - (data.swap_usd || 0);

    const potentialRewardPips = data.take_profit > 0 ? Math.abs(data.take_profit - data.opening_price) / pipValue : 0;
    const potentialRiskPips = data.stop_loss > 0 ? Math.abs(data.opening_price - data.stop_loss) / pipValue : 0;
    const risk_reward_ratio = potentialRiskPips > 0 ? potentialRewardPips / potentialRiskPips : 0;

    const updatedTrade: Trade = {
      ...trade,
      ...data,
      pips,
      profit_usd,
      risk_reward_ratio,
      session: getSession(new Date(trade.closing_time_utc)),
      mistake_1: data.mistakes ? data.mistakes[0] : undefined,
    };
    
    updateTrade(updatedTrade);
    
    toast({
      title: "Trade Updated",
      description: `Your ${data.symbol} trade has been updated successfully.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>
            Update the details of your trade for journaling and analysis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., EUR/USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="opening_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.00001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closing_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.00001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="lots"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lots</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="stop_loss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Loss</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.00001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="take_profit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Take Profit</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.00001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="commission_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="swap_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Swap ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Why did you take this trade?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="md:col-span-2">
              <FormItem>
                <FormLabel>Mistakes</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {mistakeTags.map((mistake) => (
                      <Badge
                        key={mistake}
                        variant={selectedMistakes.includes(mistake) ? "default" : "secondary"}
                        onClick={() => handleMistakeToggle(mistake)}
                        className="cursor-pointer"
                      >
                        {mistake}
                      </Badge>
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            </div>
            <div className="md:col-span-2">
              <FormItem>
                 <FormLabel>Chart Screenshot</FormLabel>
                 <FormControl>
                   <div className="flex items-center gap-4">
                     <Button type="button" variant="outline" asChild>
                       <label htmlFor="chart-upload-edit" className="cursor-pointer">
                         <Camera className="mr-2 h-4 w-4" />
                         Upload Image
                         <input id="chart-upload-edit" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                       </label>
                     </Button>
                     {chartPreview && (
                       <div className="relative">
                         <img src={chartPreview} alt="Chart preview" className="h-16 w-auto rounded-md" />
                         <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => {
                                setChartPreview(null);
                                form.setValue("chartUrl", null);
                                const fileInput = document.getElementById('chart-upload-edit') as HTMLInputElement;
                                if(fileInput) fileInput.value = "";
                            }}
                         >
                            <X className="h-4 w-4" />
                         </Button>
                       </div>
                     )}
                   </div>
                 </FormControl>
              </FormItem>
            </div>

            <DialogFooter className="md:col-span-2 mt-4">
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
