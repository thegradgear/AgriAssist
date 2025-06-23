
'use client';

import { useState } from 'react';
import type { CalculatedCosts } from './CostCalculatorForm';
import type { CostCalculatorFormData } from '@/schemas/costCalculatorSchema';
import { useAuth } from '@/contexts/AuthContext';
import { db, addDoc, collection, serverTimestamp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, PieChart as PieChartIcon, Info, Scale, Target, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostCalculatorResultsProps {
  results: CalculatedCosts | null;
  inputs: CostCalculatorFormData | null;
  loading?: boolean;
}

const formatAmount = (amount: number, precision = 2) => {
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: precision, maximumFractionDigits: precision }).format(amount);
};

// Define a report interface for data saved to Firestore
export interface CostReport {
  userId: string;
  createdAt: any; // Will be a server timestamp
  inputs: CostCalculatorFormData;
  results: CalculatedCosts;
}

export function CostCalculatorResults({ results, inputs, loading }: CostCalculatorResultsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveReport = async () => {
    if (!results || !inputs || !user) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Report',
        description: 'You must be logged in and have a valid calculation result to save.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const reportData: Omit<CostReport, 'id'> = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        inputs,
        results,
      };
      const reportsCollectionRef = collection(db, 'users', user.uid, 'costReports');
      await addDoc(reportsCollectionRef, reportData);

      toast({
        title: 'Report Saved',
        description: 'Your cost analysis has been saved to your profile.',
      });
    } catch (error: any) {
      console.error('Error saving report:', error);
      let description = 'Could not save the report. Please try again.';
      if (error.code === 'unavailable') {
        description = 'Cannot connect to the database. Please check your internet connection and try again.';
      }
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description,
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/5 mb-1" />
          <div className="h-4 bg-muted rounded w-4/5" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="p-4 bg-muted/50 rounded-md h-24" />)}
          </div>
          <div className="h-40 bg-muted/50 rounded-lg" />
          <div className="h-40 bg-muted/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!results || !inputs) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><IndianRupee className="mr-2 h-5 w-5 text-primary" />Cost & Profit Analysis</CardTitle>
          <CardDescription>Your farming cost and profit estimation will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Enter your farming details and click "Calculate" to see the analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isProfit = results.profitOrLoss >= 0;
  const chartData = results.costBreakdown.filter(item => item.amount > 0).map(item => ({ name: item.name, value: item.amount, fill: '' }));
  
  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--secondary))"];
  chartData.forEach((entry, index) => {
    entry.fill = COLORS[index % COLORS.length];
  });


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <IndianRupee className="mr-2 h-5 w-5 text-primary" />
                Analysis for {results.cropName}
              </CardTitle>
              <CardDescription>
                Based on {results.area.toLocaleString()} {results.areaUnit}(s) of cultivation.
              </CardDescription>
            </div>
            {user && (
              <Button onClick={handleSaveReport} disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save Report</>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-muted/30"><CardHeader className="pb-2 pt-4"><CardDescription className="flex items-center text-sm"><Scale className="mr-1.5 h-4 w-4"/>Total Cost</CardDescription><CardTitle className="text-xl font-bold flex items-center"><IndianRupee className="mr-1 h-5 w-5" /><span>{formatAmount(results.totalCost)}</span></CardTitle></CardHeader></Card>
            <Card className="bg-muted/30"><CardHeader className="pb-2 pt-4"><CardDescription className="flex items-center text-sm"><TrendingUp className="mr-1.5 h-4 w-4"/>Total Revenue</CardDescription><CardTitle className="text-xl font-bold flex items-center"><IndianRupee className="mr-1 h-5 w-5" /><span>{formatAmount(results.totalRevenue)}</span></CardTitle></CardHeader></Card>
            <Card className={cn("bg-muted/30", isProfit ? "border-green-500/50" : "border-red-500/50")}><CardHeader className="pb-2 pt-4"><CardDescription className="flex items-center text-sm">{isProfit ? <TrendingUp className="mr-1.5 h-4 w-4 text-green-600"/> : <TrendingDown className="mr-1.5 h-4 w-4 text-red-600"/>}Net Profit / Loss</CardDescription><CardTitle className={cn("text-xl font-bold flex items-center", isProfit ? "text-green-600" : "text-red-600")}><IndianRupee className="mr-1 h-5 w-5" /><span>{formatAmount(results.profitOrLoss)}</span></CardTitle><p className={cn("text-xs leading-normal", isProfit ? "text-green-500" : "text-red-500")}>Profit Margin: {results.profitMargin.toFixed(2)}%</p></CardHeader></Card>
          </div>
        </CardContent>
        <CardFooter><p className="text-xs text-muted-foreground leading-normal">Disclaimer: These calculations are estimates. Actual costs and revenues may vary.</p></CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Target className="mr-2 h-5 w-5 text-primary" />Break-Even Analysis</CardTitle>
          <CardDescription>Minimum yield or price required to cover your total costs.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground">Break-Even Yield</h3>
            <p className="text-2xl font-bold text-primary">{isFinite(results.breakEvenYield) ? `${formatAmount(results.breakEvenYield)} ${results.breakEvenYieldUnit}` : 'N/A'}</p>
            <p className="text-xs text-muted-foreground">Total yield needed at your expected price of ₹{formatAmount(inputs.expectedMarketPrice)} per {inputs.pricePerYieldUnit}.</p>
          </div>
           <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground">Break-Even Price</h3>
            <p className="text-2xl font-bold text-primary">{isFinite(results.breakEvenPrice) ? `₹${formatAmount(results.breakEvenPrice)} ${results.breakEvenPriceUnit}` : 'N/A'}</p>
            <p className="text-xs text-muted-foreground">Price needed for your expected yield of {formatAmount(inputs.expectedYield)} {inputs.yieldUnit} per {inputs.yieldPerAreaUnit}.</p>
          </div>
        </CardContent>
      </Card>
      
      {chartData.length > 0 && (
         <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary" />Cost Breakdown</CardTitle>
                <CardDescription>Visual breakdown of your total farming costs.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return ( <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold fill-background"> {`${(percent * 100).toFixed(0)}%`} </text> );
                            }}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4">
                    {chartData.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2 text-sm">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }}></span>
                            <span>{entry.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
