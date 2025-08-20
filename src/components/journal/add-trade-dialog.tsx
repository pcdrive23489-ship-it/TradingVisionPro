
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

const tradeSchema = z.object({
  pair: z.string().min(1, "Pair is required."),
  direction: z.enum(["buy", "sell"]),
  entryPrice: z.coerce.number().positive("Entry price must be positive."),
  exitPrice: z.coerce.number().positive("Exit price must be positive."),
  lotSize: z.coerce.number().positive("Lot size must be positive."),
  stopLoss: z.coerce.number().positive("Stop loss must be positive."),
  notes: z.string().optional(),
  mistakes: z.array(z.string()).optional(),
  chartUrl: z.any().optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

export function AddTradeDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [selectedMistakes, setSelectedMistakes] = React.useState<string[]>([]);
  const [chartPreview, setChartPreview] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      pair: "",
      direction: "buy",
      entryPrice: 0,
      exitPrice: 0,
      lotSize: 0,
      stopLoss: 0,
      notes: "",
      mistakes: [],
      chartUrl: null,
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
        setChartPreview(reader.result as string);
        form.setValue("chartUrl", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: TradeFormValues) => {
    console.log("New Trade Submitted:", data);
    toast({
      title: "Trade Logged",
      description: `Your ${data.pair} trade has been saved successfully.`,
      variant: "default",
    });
    setOpen(false);
    form.reset();
    setSelectedMistakes([]);
    setChartPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log New Trade</DialogTitle>
          <DialogDescription>
            Add the details of your trade for journaling and analysis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="pair"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Pair</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., EUR/USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direction</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade direction" />
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
              name="entryPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="lotSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lot Size</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="stopLoss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Loss</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                       <label htmlFor="chart-upload" className="cursor-pointer">
                         <Camera className="mr-2 h-4 w-4" />
                         Upload Image
                         <input id="chart-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
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
                                const fileInput = document.getElementById('chart-upload') as HTMLInputElement;
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
              <Button type="submit">Log Trade</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
