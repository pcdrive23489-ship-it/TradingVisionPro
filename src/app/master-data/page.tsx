
"use client"

import * as React from "react"
import { Upload, Download } from "lucide-react"

import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockTrades } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import type { Trade } from "@/lib/types"

// Function to convert array of objects to CSV
const convertToCSV = (objArray: any[]) => {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const header = Object.keys(array[0]).join(',');
    str += header + '\r\n';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ','
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}

// Function to trigger CSV download
const downloadCSV = (trades: Trade[]) => {
    const csvString = convertToCSV(trades.map(t => ({...t, mistakes: t.mistakes.join(';')})));
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "trading_history.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


export default function MasterDataPage() {
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadCSV(mockTrades)
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
      console.log("Importing file:", file.name);
      // Here you would typically parse the CSV and update your state
      toast({
        title: "Import Started",
        description: `${file.name} is being processed.`,
      });
    }
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
                    Export your entire trading history to a CSV file or import trades from a file.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
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
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
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
                  <TableHead>Pair</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.pair}</TableCell>
                    <TableCell>{trade.direction}</TableCell>
                    <TableCell>{trade.session}</TableCell>
                    <TableCell>{new Date(trade.date).toLocaleDateString()}</TableCell>
                    <TableCell className={`text-right font-semibold ${trade.profit >= 0 ? "text-accent" : "text-destructive"}`}>
                      ${trade.profit.toFixed(2)}
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
