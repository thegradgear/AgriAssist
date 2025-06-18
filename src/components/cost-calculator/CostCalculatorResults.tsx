
'use client';

import type { CalculatedCosts } from './CostCalculatorForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Info, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostCalculatorResultsProps {
  results: CalculatedCosts | null;
  loading?: boolean; // Optional loading state for skeleton
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
};

export function CostCalculatorResults({ results, loading }: CostCalculatorResultsProps) {
  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-7 bg-muted rounded w-3/5 mb-2"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="p-4 bg-muted/50 rounded-md h-24"></div>)}
          </div>
          <div>
            <div className="h-6 bg-muted rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="flex justify-between"><div className="h-4 bg-muted rounded w-1/4"></div><div className="h-4 bg-muted rounded w-1/5"></div></div>)}
            </div>
            <div className="h-5 bg-muted rounded w-full mt-3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <DollarSign className="mr-2 h-6 w-6 text-primary" />
            Cost & Profit Analysis
          </CardTitle>
          <CardDescription>Your farming cost and profit estimation will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <Info className="mx-auto h-12 w-12 mb-4" />
            <p>Enter your farming details in the form to see the analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isProfit = results.profitOrLoss >= 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <DollarSign className="mr-2 h-6 w-6 text-primary" />
          Cost & Profit Analysis for {results.cropName}
        </CardTitle>
        <CardDescription>
          Based on {results.area.toLocaleString()} {results.areaUnit}(s) of cultivation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-sm"><Scale className="mr-1.5 h-4 w-4"/>Total Cost</CardDescription>
              <CardTitle className="text-2xl font-bold">{formatCurrency(results.totalCost)}</CardTitle>
            </CardHeader>
          </Card>
           <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-sm"><TrendingUp className="mr-1.5 h-4 w-4"/>Total Revenue</CardDescription>
              <CardTitle className="text-2xl font-bold">{formatCurrency(results.totalRevenue)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className={cn("bg-muted/30", isProfit ? "border-green-500/50" : "border-red-500/50")}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-sm">
                {isProfit ? <TrendingUp className="mr-1.5 h-4 w-4 text-green-600"/> : <TrendingDown className="mr-1.5 h-4 w-4 text-red-600"/>}
                Net Profit / Loss
              </CardDescription>
              <CardTitle className={cn("text-2xl font-bold", isProfit ? "text-green-600" : "text-red-600")}>
                {formatCurrency(results.profitOrLoss)}
              </CardTitle>
              <p className={cn("text-xs", isProfit ? "text-green-500" : "text-red-500")}>
                Profit Margin: {results.profitMargin.toFixed(2)}%
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Cost Breakdown */}
        {results.costBreakdown.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold font-headline mb-3 flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-primary" />
              Cost Breakdown
            </h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead className="text-right">Amount (INR)</TableHead>
                        <TableHead className="text-right">Percentage of Total Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.costBreakdown.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                            <TableCell className="text-right">{item.percentage.toFixed(2)}%</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
            Disclaimer: These calculations are estimates based on your inputs. Actual costs and revenues may vary due to market fluctuations, weather conditions, and other unforeseen factors.
        </p>
      </CardFooter>
    </Card>
  );
}
