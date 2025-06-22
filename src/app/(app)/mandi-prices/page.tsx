
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, CalendarIcon, Search, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { format as formatDateFns } from 'date-fns';

interface MandiRecord {
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety: string;
    min_price: string;
    max_price: string;
    modal_price: string;
}

export default function MandiPricesPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [prices, setPrices] = useState<MandiRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isShowingMockData, setIsShowingMockData] = useState(false);
    const { toast } = useToast();

    const fetchPrices = async (fetchDate: Date) => {
        setIsLoading(true);
        setError(null);
        setPrices([]);
        setIsShowingMockData(false);

        const formattedDate = formatDateFns(fetchDate, 'yyyy-MM-dd');

        try {
            const response = await fetch(`/api/mandi-prices?date=${formattedDate}&limit=500`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch prices.');
            }
            
            if (data.isMockData) {
                setIsShowingMockData(true);
                setPrices(data.records);
            } else if (data.records && data.records.length > 0) {
                setPrices(data.records);
                toast({
                    title: 'Prices Loaded',
                    description: `${data.records.length} records found for ${formatDateFns(fetchDate, 'PPP')}.`
                });
            } else {
                setPrices([]);
                 toast({
                    title: 'No Data Found',
                    description: `No market price data found for ${formatDateFns(fetchDate, 'PPP')}. This is common for Sundays or public holidays.`
                });
            }
            
        } catch (err: any) {
            console.error('Failed to fetch Mandi prices:', err);
            setError(err.message || 'An unexpected error occurred.');
            toast({
                variant: 'destructive',
                title: 'Error Fetching Prices',
                description: err.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch prices on initial load for today's date
    useEffect(() => {
        fetchPrices(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = () => {
        if (date) {
            fetchPrices(date);
        } else {
            toast({
                variant: 'destructive',
                title: 'No Date Selected',
                description: 'Please select a date to fetch prices.',
            });
        }
    };

    const formatPrice = (price: string) => {
        const num = Number(price);
        if (isNaN(num)) return price;
        return num.toLocaleString('en-IN');
    }

    return (
        <div className="container mx-auto">
            <PageHeader
                title="Live Mandi Prices"
                description="Get daily market prices for various crops from mandis across India."
            />

            <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                    <CardDescription>Choose a date to view market prices. Data is provided by Agmarknet.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[280px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            suppressHydrationWarning
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? formatDateFns(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(newDate) => {
                                    if (newDate) setDate(newDate);
                                    setIsCalendarOpen(false);
                                }}
                                disabled={(d) => d > new Date() || d < new Date("2020-01-01")}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleSearch} disabled={isLoading} suppressHydrationWarning>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Fetch Prices
                    </Button>
                </CardContent>
            </Card>
            
            {isShowingMockData && (
                 <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Displaying Sample Data</AlertTitle>
                    <AlertDescription>
                        Could not fetch live market prices. The data below is for demonstration purposes and may not reflect the selected date. Please check your API key or try again later.
                    </AlertDescription>
                </Alert>
            )}

            {isLoading && (
                 <Card>
                    <CardContent className="p-6 text-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                        <p className="mt-4 text-muted-foreground">Fetching latest mandi prices...</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && error && !isShowingMockData && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <div>
                            <h3 className="font-semibold text-destructive">Failed to Load Data</h3>
                            <p className="text-sm text-destructive/80">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !isShowingMockData && prices.length === 0 && (
                <Card>
                    <CardContent className="p-6 text-center">
                        <Landmark className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="mt-4 font-semibold">No Price Data Available</p>
                        <p className="text-sm text-muted-foreground">There were no price records found for the selected date. Please try another date.</p>
                    </CardContent>
                </Card>
            )}
            
            {!isLoading && prices.length > 0 && (
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Market Prices for {isShowingMockData ? 'Sample Data' : (date ? formatDateFns(date, 'PPP') : '')}</CardTitle>
                        <CardDescription>Showing prices in INR per Quintal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-card z-10">Mandi</TableHead>
                                            <TableHead>Crop</TableHead>
                                            <TableHead>Variety</TableHead>
                                            <TableHead className="text-right">Min Price</TableHead>
                                            <TableHead className="text-right">Max Price</TableHead>
                                            <TableHead className="font-semibold text-right">Modal Price</TableHead>
                                            <TableHead>State</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {prices.map((price, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium sticky left-0 bg-card z-10">{price.market}</TableCell>
                                                <TableCell>{price.commodity}</TableCell>
                                                <TableCell>{price.variety}</TableCell>
                                                <TableCell className="text-right">{formatPrice(price.min_price)}</TableCell>
                                                <TableCell className="text-right">{formatPrice(price.max_price)}</TableCell>
                                                <TableCell className="font-semibold text-right">{formatPrice(price.modal_price)}</TableCell>
                                                <TableCell className="text-muted-foreground">{price.state}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
