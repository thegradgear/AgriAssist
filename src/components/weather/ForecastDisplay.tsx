
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import Image from 'next/image';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { CloudDrizzle, Thermometer } from 'lucide-react';

export interface HourlyForecastData {
  time: string;
  temp: number;
  precipitation: number;
}

export interface DailyForecastData {
  date: string;
  day: string;
  icon: string;
  temp_max: number;
  temp_min: number;
  description: string;
}

interface ForecastDisplayProps {
  hourly: HourlyForecastData[];
  daily: DailyForecastData[];
}

const chartConfig: ChartConfig = {
  temp: {
    label: 'Temp (°C)',
    color: 'hsl(var(--primary))',
    icon: Thermometer,
  },
  precipitation: {
    label: 'Precipitation (%)',
    color: 'hsl(var(--secondary))',
    icon: CloudDrizzle,
  },
};

export function ForecastDisplay({ hourly, daily }: ForecastDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Hourly Forecast Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Forecast (Next 24h)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Temperature Chart */}
          <div>
            <h3 className="text-base font-medium mb-2 flex items-center">
              <Thermometer className="mr-2 h-4 w-4 text-muted-foreground" />
              Temperature Trend (°C)
            </h3>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={hourly} margin={{ left: -20, right: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}°`}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <ChartTooltip
                  cursor={true}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="temp"
                  type="natural"
                  fill="var(--color-temp)"
                  fillOpacity={0.4}
                  stroke="var(--color-temp)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </div>
          {/* Precipitation Chart */}
           <div>
            <h3 className="text-base font-medium mb-2 flex items-center">
              <CloudDrizzle className="mr-2 h-4 w-4 text-muted-foreground" />
              Precipitation Probability (%)
            </h3>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={hourly} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                    <Bar dataKey="precipitation" fill="var(--color-precipitation)" radius={4} />
                </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Forecast List */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {daily.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                         <Image
                            src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                            alt={day.description}
                            layout="fill"
                            objectFit="contain"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-base">{day.day}</p>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-base">{day.temp_max}° / {day.temp_min}°</p>
                    <p className="text-sm text-muted-foreground">High / Low</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
