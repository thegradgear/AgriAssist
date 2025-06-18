
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplet, Wind, CloudSun, Sunrise, Sunset, Cloud, Gauge } from 'lucide-react';
import { format } from 'date-fns';

export interface CurrentWeatherData {
  cityName: string;
  temperature: number; // Celsius
  description: string;
  icon: string; // Icon code from OpenWeatherMap
  humidity: number; // Percentage
  windSpeed: number; // m/s
  feelsLike: number; // Celsius
  sunrise: number; // Unix timestamp UTC
  sunset: number;  // Unix timestamp UTC
  cloudiness: number; // Percentage cloud cover
  pressure: number; // hPa
}

interface CurrentWeatherDisplayProps {
  weather: CurrentWeatherData;
}

const capitalizeWords = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatTimeFromTimestamp = (timestamp: number, timezoneOffset: number = 0): string => {
  // Check if timestamp is a valid, finite number
  if (timestamp === null || timestamp === undefined || !isFinite(timestamp)) {
    console.warn("Invalid timestamp received for formatting:", timestamp);
    return "N/A";
  }

  try {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp (seconds) to milliseconds
    if (isNaN(date.getTime())) { // Double check if date object is valid
        console.warn("Failed to create valid date from timestamp:", timestamp);
        return "N/A";
    }
    return format(date, 'h:mm a'); // e.g., 6:30 AM
  } catch (e) {
    console.error("Error formatting time:", e);
    return "N/A";
  }
};


export function CurrentWeatherDisplay({ weather }: CurrentWeatherDisplayProps) {
  if (!weather) return null;

  return (
    <Card className="shadow-xl rounded-lg overflow-hidden bg-card">
      <CardHeader className="bg-primary/10 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-headline text-primary">
              {weather.cityName}
            </CardTitle>
            <CardDescription className="text-sm text-primary/80">
              Current Weather Conditions
            </CardDescription>
          </div>
          {weather.icon && (
            <div className="relative h-16 w-16 sm:h-20 sm:w-20">
              <Image
                src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                alt={weather.description}
                layout="fill"
                objectFit="contain"
                data-ai-hint="weather condition"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex flex-col items-center sm:items-start p-4 bg-background/50 rounded-md shadow">
          <div className="flex items-center text-primary mb-1">
            <Thermometer className="h-7 w-7 mr-2" />
            <span className="text-4xl font-bold">{Math.round(weather.temperature)}°C</span>
          </div>
          <p className="text-lg text-foreground font-medium">{capitalizeWords(weather.description)}</p>
          <p className="text-sm text-muted-foreground">Feels like {Math.round(weather.feelsLike)}°C</p>
        </div>
        
        <div className="space-y-3 p-4 bg-background/50 rounded-md shadow">
          <div className="flex items-center text-sm">
            <Droplet className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Humidity:</span>
            <span className="ml-auto text-muted-foreground">{weather.humidity}%</span>
          </div>
          <div className="flex items-center text-sm">
            <Wind className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Wind:</span>
            <span className="ml-auto text-muted-foreground">{weather.windSpeed.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center text-sm">
            <Cloud className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Cloud Cover:</span>
            <span className="ml-auto text-muted-foreground">{weather.cloudiness}%</span>
          </div>
          <div className="flex items-center text-sm">
            <Gauge className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Pressure:</span>
            <span className="ml-auto text-muted-foreground">{weather.pressure} hPa</span>
          </div>
        </div>
        
        <div className="sm:col-span-2 grid grid-cols-2 gap-4 p-4 bg-background/50 rounded-md shadow">
            <div className="flex flex-col items-center">
                <Sunrise className="h-8 w-8 text-amber-500 mb-1" />
                <p className="text-sm font-medium text-foreground">Sunrise</p>
                <p className="text-sm text-muted-foreground">{formatTimeFromTimestamp(weather.sunrise)}</p>
            </div>
            <div className="flex flex-col items-center">
                <Sunset className="h-8 w-8 text-orange-600 mb-1" />
                <p className="text-sm font-medium text-foreground">Sunset</p>
                <p className="text-sm text-muted-foreground">{formatTimeFromTimestamp(weather.sunset)}</p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
