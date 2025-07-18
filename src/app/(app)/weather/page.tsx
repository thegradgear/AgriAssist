
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CurrentWeatherDisplay, type CurrentWeatherData } from '@/components/weather/CurrentWeatherDisplay';
import { ForecastDisplay, type DailyForecastData, type HourlyForecastData } from '@/components/weather/ForecastDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, AlertTriangle, MapPin, Search, Navigation, Star, Trash2, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SavedLocation extends Coordinates {
  name: string;
}

const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

const capitalizeWords = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const WeatherPageSkeleton = () => (
    <div className="container mx-auto animate-pulse">
      <PageHeader
        title="Weather Forecasts"
        description="Get detailed current, hourly, and 5-day weather forecasts for any location."
      />
      
      <Card className="mb-8">
        <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-32 rounded-full" />
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
            <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        
        {/* Current Weather Skeleton */}
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 rounded-md" />
                        <Skeleton className="h-5 w-64 rounded-md mt-2" />
                    </div>
                    <Skeleton className="h-20 w-20 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <div className="flex flex-col items-center sm:items-start p-4 bg-muted/50 rounded-md">
                    <Skeleton className="h-10 w-32 rounded-md" />
                    <Skeleton className="h-6 w-24 rounded-md mt-2" />
                    <Skeleton className="h-4 w-28 rounded-md mt-1" />
                </div>
                <div className="space-y-3 p-4 bg-muted/50 rounded-md">
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-5 w-full rounded-md" />
                </div>
            </CardContent>
        </Card>

        {/* Forecast Skeleton */}
        <Card>
            <CardHeader><Skeleton className="h-7 w-48 rounded-md" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full rounded-md" /></CardContent>
        </Card>
      </div>
    </div>
);

export default function WeatherPage() {
  const router = useRouter();
  const [cityInput, setCityInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);

  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastData[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastData[]>([]);
  
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const geocodeCity = useCallback(async (city: string): Promise<SavedLocation> => {
    if (!OPENWEATHERMAP_API_KEY) throw new Error("API key is not configured.");
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`);
    if (!geoResponse.ok) throw new Error(`The location service failed to respond for '${city}'.`);
    const geoData = await geoResponse.json();
    if (geoData.length === 0) throw new Error(`Could not find location: '${city}'. Please check the spelling or be more specific.`);
    
    const { lat, lon, name, state, country } = geoData[0];
    return { name: `${name}${state ? ', ' + state : ''}, ${country}`, latitude: lat, longitude: lon };
  }, []);

  const fetchWeatherData = useCallback(async (location: SavedLocation) => {
    if (!OPENWEATHERMAP_API_KEY) {
      const errorMsg = "OpenWeatherMap API key is not configured. Please set NEXT_PUBLIC_OPENWEATHERMAP_API_KEY.";
      setError(errorMsg);
      toast({ variant: 'destructive', title: 'Configuration Error', description: errorMsg });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedLocation(location);

    try {
      const { latitude, longitude, name } = location;

      const [currentWeatherResponse, forecastResponse] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`),
      ]);

      for (const response of [currentWeatherResponse, forecastResponse]) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            let message = `The weather service returned an error (${response.status}).`;
            if (response.status === 401) {
                message = "The OpenWeatherMap API key is invalid. Please check your configuration.";
            } else if (response.status === 404) {
                message = `Could not find weather data for "${name}". The location may not be supported.`;
            } else if (errorData && errorData.message) {
                message = capitalizeWords(errorData.message);
            }
            throw new Error(message);
        }
      }
      
      const currentData = await currentWeatherResponse.json();
      const forecastData = await forecastResponse.json();

      const mappedCurrentWeather: CurrentWeatherData = {
        cityName: name,
        temperature: currentData.main.temp,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        feelsLike: currentData.main.feels_like,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        cloudiness: currentData.clouds.all,
        pressure: currentData.main.pressure,
        rain1h: currentData.rain ? currentData.rain['1h'] : undefined,
      };

      const mappedHourlyForecast: HourlyForecastData[] = (forecastData.list || []).slice(0, 8).map((h: any) => ({
        time: format(new Date(h.dt * 1000), 'ha'),
        temp: Math.round(h.main.temp),
        precipitation: Math.round((h.pop || 0) * 100),
      }));

      const dailyForecasts: { [key: string]: { temps: number[], icons: { [key: string]: number }, descriptions: { [key: string]: number }, rain: number[] } } = {};
      forecastData.list.forEach((entry: any) => {
          const date = format(new Date(entry.dt * 1000), 'yyyy-MM-dd');
          if (!dailyForecasts[date]) {
              dailyForecasts[date] = { temps: [], icons: {}, descriptions: {}, rain: [] };
          }
          dailyForecasts[date].temps.push(entry.main.temp);
          const icon = entry.weather[0].icon.replace('n', 'd'); // Use day icon for consistency
          dailyForecasts[date].icons[icon] = (dailyForecasts[date].icons[icon] || 0) + 1;
          const desc = entry.weather[0].description;
          dailyForecasts[date].descriptions[desc] = (dailyForecasts[date].descriptions[desc] || 0) + 1;
          if (entry.rain && entry.rain['3h']) {
            dailyForecasts[date].rain.push(entry.rain['3h']);
          }
      });

      const mappedDailyForecast: DailyForecastData[] = Object.keys(dailyForecasts).slice(0, 5).map(date => {
          const dayData = dailyForecasts[date];
          const temp_min = Math.round(Math.min(...dayData.temps));
          const temp_max = Math.round(Math.max(...dayData.temps));
          const icon = Object.keys(dayData.icons).reduce((a, b) => dayData.icons[a] > dayData.icons[b] ? a : b);
          const description = Object.keys(dayData.descriptions).reduce((a, b) => dayData.descriptions[a] > dayData.descriptions[b] ? a : b);
          const totalRainMM = dayData.rain.reduce((acc, val) => acc + val, 0);

          return {
              date: format(parseISO(date), 'E, MMM d'),
              day: format(parseISO(date), 'EEEE'),
              icon,
              temp_max,
              temp_min,
              description: capitalizeWords(description),
              rainfallMM: Math.round(totalRainMM),
          };
      });

      setCurrentWeather(mappedCurrentWeather);
      setHourlyForecast(mappedHourlyForecast);
      setDailyForecast(mappedDailyForecast);

      localStorage.setItem('lastSelectedLocation', JSON.stringify(location));
      toast({ title: 'Weather Updated', description: `Fetched weather for ${name}.` });

    } catch (err: any) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error Fetching Weather', description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast, geocodeCity]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    try {
        const location = await geocodeCity(cityInput);
        fetchWeatherData(location);
    } catch(err: any) {
        setError(err.message);
        toast({ variant: 'destructive', title: 'Location Error', description: err.message });
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
     if (!OPENWEATHERMAP_API_KEY) {
      setError("API key is not configured.");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`);
          if (!response.ok) throw new Error("Failed to get location name from coordinates.");
          const data = await response.json();
          const name = data[0] ? `${data[0].name}, ${data[0].country}` : "Current Location";
          fetchWeatherData({ name, latitude, longitude });
        } catch (err: any) {
           setError(err.message);
           toast({ variant: 'destructive', title: 'Location Error', description: err.message });
           setIsLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services in your browser settings.");
        toast({ variant: 'destructive', title: 'Location Denied', description: 'Please enable location services for this site.' });
        setIsLoading(false);
      }
    );
  };

  const addSavedLocation = () => {
    if (selectedLocation && !savedLocations.some(l => l.name === selectedLocation.name)) {
      const newSavedLocations = [...savedLocations, selectedLocation];
      setSavedLocations(newSavedLocations);
      localStorage.setItem('savedLocations', JSON.stringify(newSavedLocations));
      toast({ title: "Location Saved", description: `${selectedLocation.name} added to your favorites.`});
    }
  };

  const removeSavedLocation = (locationToRemove: SavedLocation) => {
    const newSavedLocations = savedLocations.filter(l => l.name !== locationToRemove.name);
    setSavedLocations(newSavedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(newSavedLocations));
    toast({ title: "Location Removed", description: `${locationToRemove.name} removed from your favorites.`});
  };

  const handlePlanIrrigation = () => {
    if (!dailyForecast || dailyForecast.length === 0 || !selectedLocation) {
      toast({
        variant: 'destructive',
        title: 'No Forecast Data',
        description: 'Please fetch a weather forecast for a location before planning irrigation.'
      });
      return;
    }

    const forecastForUrl = dailyForecast.map(day => ({
      day: day.day,
      maxTempC: day.temp_max,
      rainfallMM: day.rainfallMM || 0,
    }));
    
    const forecastString = encodeURIComponent(JSON.stringify(forecastForUrl));
    const locationString = encodeURIComponent(selectedLocation.name);
    router.push(`/irrigation-management?forecast=${forecastString}&location=${locationString}`);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedLocations');
      if (saved) setSavedLocations(JSON.parse(saved));
      
      const lastSelected = localStorage.getItem('lastSelectedLocation');
      if (lastSelected) {
        fetchWeatherData(JSON.parse(lastSelected));
      } else {
        setIsLoading(false);
      }
    } catch (e) {
        console.error("Error loading from localStorage", e);
        setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount
  
  if (isLoading && !currentWeather) {
    return <WeatherPageSkeleton />;
  }

  const isLocationSaved = selectedLocation && savedLocations.some(l => l.name === selectedLocation.name);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Weather Forecasts"
        description="Get detailed current, hourly, and 5-day weather forecasts for any location."
      />
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle>Location Search</CardTitle>
            <CardDescription>Search for a city or use your current location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g., New Delhi"
                className="flex-grow"
                suppressHydrationWarning
              />
              <Button type="submit" disabled={isLoading} suppressHydrationWarning>
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
              <Button type="button" variant="outline" onClick={handleGetCurrentLocation} disabled={isLoading} suppressHydrationWarning>
                <Navigation className="h-4 w-4" />
                 <span className="sr-only">Use my location</span>
              </Button>
            </form>
             {savedLocations.length > 0 && (
                <div className="space-y-2">
                    <Label>Saved Locations</Label>
                    <div className="flex flex-wrap gap-2">
                        {savedLocations.map(loc => (
                             <div key={loc.name} className="flex items-center gap-1 rounded-full border bg-secondary/50 pl-3 pr-1">
                                <button onClick={() => fetchWeatherData(loc)} className="text-sm font-medium hover:text-primary">{loc.name}</button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeSavedLocation(loc)}>
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      {error && !isLoading && (
        <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                    <h3 className="font-semibold text-destructive">Failed to Load Weather Data</h3>
                    <p className="text-sm text-destructive/80">{error}</p>
                     {error.toLowerCase().includes("api key") && (
                        <p className="text-xs mt-2 leading-normal">
                            There might be an issue with the OpenWeatherMap configuration on the server. Please check environment variables.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
      )}

      {!isLoading && !error && selectedLocation && (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className='flex items-center gap-2'>
                    <Button onClick={() => fetchWeatherData(selectedLocation)} variant="outline" disabled={isLoading} suppressHydrationWarning>
                        <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button onClick={addSavedLocation} variant="outline" disabled={isLocationSaved || isLoading} suppressHydrationWarning>
                        <Star className={cn("mr-2 h-4 w-4", isLocationSaved && "fill-amber-400 text-amber-500")} />
                        {isLocationSaved ? 'Saved' : 'Save Location'}
                    </Button>
                </div>
                <Button onClick={handlePlanIrrigation} variant="default" disabled={isLoading} suppressHydrationWarning>
                    <Droplets className="mr-2 h-4 w-4" />
                    Plan Irrigation
                </Button>
            </div>

            {currentWeather && <CurrentWeatherDisplay weather={currentWeather} />}
            
            {(hourlyForecast.length > 0 || dailyForecast.length > 0) && (
              <ForecastDisplay hourly={hourlyForecast} daily={dailyForecast} />
            )}
        </div>
      )}

       {!isLoading && !error && !selectedLocation && (
             <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
                <MapPin className="mx-auto h-16 w-16 text-primary mb-4" />
                <p className="text-xl font-semibold">Select a Location</p>
                <p className="text-muted-foreground mt-1">
                  Search for a city or use your current location to get the weather forecast.
                </p>
            </div>
          )}

    </div>
  );
}
