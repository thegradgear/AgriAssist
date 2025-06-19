
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplet, Wind, Sunrise, Sunset, Cloud, Gauge } from 'lucide-react'; // CloudSun removed as icon is dynamic
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

const formatTimeFromTimestamp = (timestamp: number): string => {
  if (timestamp === null || timestamp === undefined || !isFinite(timestamp)) {
    return "N/A";
  }
  try {
    const date = new Date(timestamp * 1000); 
    if (isNaN(date.getTime())) {
        return "N/A";
    }
    return format(date, 'h:mm a'); 
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
            {/* CardTitle is text-lg font-medium by default */}
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary"> {/* Overriding for larger display */}
              {weather.cityName}
            </CardTitle>
            {/* CardDescription is text-sm by default */}
            <CardDescription className="text-primary/80">
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
            <span className="text-4xl font-bold leading-tight">{Math.round(weather.temperature)}°C</span> {/* Data display */}
          </div>
          <p className="text-lg text-foreground font-medium leading-snug">{capitalizeWords(weather.description)}</p> {/* Large body for description */}
          <p className="text-sm text-muted-foreground leading-normal">Feels like {Math.round(weather.feelsLike)}°C</p> {/* Small text */}
        </div>
        
        <div className="space-y-3 p-4 bg-background/50 rounded-md shadow">
          <div className="flex items-center text-sm leading-normal">
            <Droplet className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Humidity:</span>
            <span className="ml-auto text-muted-foreground font-code">{weather.humidity}%</span> {/* Data: font-code */}
          </div>
          <div className="flex items-center text-sm leading-normal">
            <Wind className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Wind:</span>
            <span className="ml-auto text-muted-foreground font-code">{weather.windSpeed.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center text-sm leading-normal">
            <Cloud className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Cloud Cover:</span>
            <span className="ml-auto text-muted-foreground font-code">{weather.cloudiness}%</span>
          </div>
          <div className="flex items-center text-sm leading-normal">
            <Gauge className="h-5 w-5 mr-2 text-primary/80" />
            <span className="font-medium text-foreground">Pressure:</span>
            <span className="ml-auto text-muted-foreground font-code">{weather.pressure} hPa</span>
          </div>
        </div>
        
        <div className="sm:col-span-2 grid grid-cols-2 gap-4 p-4 bg-background/50 rounded-md shadow">
            <div className="flex flex-col items-center">
                <Sunrise className="h-8 w-8 text-amber-500 mb-1" />
                <p className="text-sm font-medium text-foreground leading-normal">Sunrise</p> {/* Label */}
                <p className="text-sm text-muted-foreground leading-normal font-code">{formatTimeFromTimestamp(weather.sunrise)}</p> {/* Data */}
            </div>
            <div className="flex flex-col items-center">
                <Sunset className="h-8 w-8 text-orange-600 mb-1" />
                <p className="text-sm font-medium text-foreground leading-normal">Sunset</p>
                <p className="text-sm text-muted-foreground leading-normal font-code">{formatTimeFromTimestamp(weather.sunset)}</p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
