
"use client"

import * as React from "react"
import { Upload, Download, Trash2 } from "lucide-react"

import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { Trade } from "@/lib/types"
import { format } from "date-fns"
import { useTrades } from "@/context/trade-provider"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// Function to convert array of objects to CSV
const convertToCSV = (objArray: any[]) => {
    if (objArray.length === 0) return "";
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const header = Object.keys(array[0]).join(',');
    str += header + '\r\n';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ','
            let value = array[i][index];
            if (Array.isArray(value)) {
                value = value.join(';');
            }
            line += `"${value}"`;
        }
        str += line + '\r\n';
    }
    return str;
}


export default function MasterDataPage() {
  const { trades, setTrades } = useTrades();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Function to trigger CSV download
  const downloadCSV = (trades: Trade[]) => {
      const csvString = convertToCSV(trades);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', 'trading_history.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
    toast({
        title: "Export Successful",
        description: "Your trading history has been downloaded as a CSV file.",
    })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            toast({ title: "Error", description: "CSV file is empty or has no data.", variant: "destructive" });
            return;
        }
        const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const newTrades: Trade[] = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const tradeObject: any = {};
          header.forEach((h, i) => {
            const value = values[i];
            const numberFields = ['ticket', 'lots', 'original_position_size', 'opening_price', 'closing_price', 'stop_loss', 'take_profit', 'commission_usd', 'swap_usd', 'profit_usd', 'equity_usd', 'risk_reward_ratio', 'pips', 'profit_inr'];

            if (numberFields.includes(h)) {
              tradeObject[h] = parseFloat(value) || 0;
            } else if (h === 'mistakes' && value) {
              tradeObject[h] = value.split(';');
            } else {
              tradeObject[h] = value;
            }
          });

          // INR to USD conversion
          if (tradeObject.profit_inr) {
            tradeObject.profit_usd = tradeObject.profit_inr / 88;
          }
          
          return tradeObject as Trade;
        });
        setTrades(newTrades);
        toast({
          title: "Import Successful",
          description: `${file.name} has been imported.`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteAllData = () => {
    setTrades([]);
    toast({
      title: "Data Cleared",
      description: "All trading data has been deleted.",
    });
  };


  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Master Data</h1>
          <p className="text-muted-foreground">Manage your trading data in bulk.</p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Import / Export</CardTitle>
                <CardDescription>
                    Export your entire trading history to a CSV file or import trades from a file. The expected format is: ticket, opening_time_utc, closing_time_utc, type, lots, original_position_size, symbol, opening_price, closing_price, stop_loss, take_profit, commission_usd, swap_usd, profit_usd (or profit_inr), equity_usd, margin_level, close_reason, notes, chartUrl, mistakes, session, risk_reward_ratio, pips
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                <Button onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" /> Import CSV
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                />
                <Button variant="outline" onClick={() => downloadCSV(trades)}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your
                        trading data from the application.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllData}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading History</CardTitle>
            <CardDescription>A complete log of all your trades.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Close Reason</TableHead>
                  <TableHead>Closing Time</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => (
                  <TableRow key={`${trade.ticket}-${trade.closing_time_utc}-${index}`}>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>{trade.type}</TableCell>
                    <TableCell>{trade.close_reason}</TableCell>
                    <TableCell>{format(new Date(trade.closing_time_utc), 'Pp')}</TableCell>
                    <TableCell className={`text-right font-semibold ${trade.profit_usd >= 0 ? "text-accent" : "text-destructive"}`}>
                      ${(trade.profit_usd || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
