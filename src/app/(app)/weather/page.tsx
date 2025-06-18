
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { WeatherAlertCard, type WeatherAlert } from '@/components/weather/WeatherAlertCard';
import { CurrentWeatherDisplay, type CurrentWeatherData } from '@/components/weather/CurrentWeatherDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, LocateFixed, RefreshCw, AlertTriangle, CloudSun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const isValidLatitude = (lat: number) => lat >= -90 && lat <= 90;
const isValidLongitude = (lon: number) => lon >= -180 && lon <= 180;

const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;


export default function WeatherPage() {
  const [locationInput, setLocationInput] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mapOpenWeatherMapAlert = (alertData: any, index: number): WeatherAlert => {
    let severity: WeatherAlert['severity'] = 'Moderate'; // Default
    const eventLower = alertData.event?.toLowerCase() || "";
    if (eventLower.includes('warning')) severity = 'High';
    if (eventLower.includes('watch') || eventLower.includes('advisory')) severity = 'Moderate';
    if (eventLower.includes('statement')) severity = 'Low';

    return {
      id: `${alertData.event?.replace(/\s+/g, '-') || 'alert'}-${index}`,
      event: alertData.event || "Weather Alert",
      severity: severity,
      headline: alertData.description || "Important weather information.", // OWM often puts headline-like content in description
      description: alertData.description || "Details not available.",
      instruction: alertData.instruction || undefined, // OWM alerts might not have separate instruction field often
      sent: alertData.start ? new Date(alertData.start * 1000).toISOString() : new Date().toISOString(),
      effective: alertData.start ? new Date(alertData.start * 1000).toISOString() : new Date().toISOString(),
      expires: alertData.end ? new Date(alertData.end * 1000).toISOString() : undefined,
      areaDesc: coordinates ? `Around Lat: ${coordinates.latitude.toFixed(2)}, Lon: ${coordinates.longitude.toFixed(2)}` : "Selected area",
      senderName: alertData.sender_name || "Weather Service",
      tags: alertData.tags || [],
    };
  };

  const fetchWeatherData = useCallback(async (coords: Coordinates) => {
    if (!coords) return;

    if (!OPENWEATHERMAP_API_KEY) {
        const apiKeyError = "OpenWeatherMap API key is not configured. Please set the NEXT_PUBLIC_OPENWEATHERMAP_API_KEY environment variable.";
        setError(apiKeyError);
        setIsLoadingData(false);
        setAlerts([]);
        setCurrentWeather(null);
        return;
    }

    if (!isValidLatitude(coords.latitude) || !isValidLongitude(coords.longitude)) {
      const latError = !isValidLatitude(coords.latitude) ? `Latitude (${coords.latitude}) must be between -90 and 90.` : '';
      const lonError = !isValidLongitude(coords.longitude) ? `Longitude (${coords.longitude}) must be between -180 and 180.` : '';
      const combinedError = [latError, lonError].filter(Boolean).join(' ');
      setError(combinedError || 'Invalid coordinates provided.');
      toast({
        variant: 'destructive',
        title: 'Invalid Coordinates',
        description: combinedError || 'Please check the latitude and longitude values.',
      });
      setIsLoadingData(false);
      setAlerts([]);
      setCurrentWeather(null);
      return;
    }

    setIsLoadingData(true);
    setError(null);
    setAlerts([]);
    setCurrentWeather(null);

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      
      if (!response.ok) {
        let errorMsg = `Error fetching weather data: ${response.statusText} (${response.status})`;
         try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                 errorMsg = errorData.message;
            }
        } catch (e) {
            // Failed to parse error JSON, stick with the statusText
        }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();

      // Process current weather
      if (data.weather && data.weather.length > 0 && data.main) {
        setCurrentWeather({
          cityName: data.name,
          temperature: data.main.temp,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          feelsLike: data.main.feels_like,
        });
      } else {
        setCurrentWeather(null); // No current weather data or malformed
      }

      // Process alerts
      if (data.alerts && data.alerts.length > 0) {
        const mappedAlerts = data.alerts.map(mapOpenWeatherMapAlert)
          .sort((a: WeatherAlert, b: WeatherAlert) => new Date(b.sent).getTime() - new Date(a.sent).getTime());
        setAlerts(mappedAlerts);
         toast({
            title: 'Weather Data Updated',
            description: `Current weather and ${mappedAlerts.length} alerts found.`,
        });
      } else {
        setAlerts([]);
        toast({
            title: 'Weather Data Updated',
            description: 'Current weather fetched. No active alerts reported by OpenWeatherMap for this location.',
        });
      }
    } catch (err: any) {
      console.error("Fetch weather data error:", err);
      const errorMessage = err.message || 'Failed to fetch weather data.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Data',
        description: `${errorMessage} Please check your API key, subscription, or network. If you recently updated your API key, try restarting the server.`,
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]); // Removed coordinates from dep array as it's passed as arg

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parts = locationInput.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        const newCoords = { latitude: lat, longitude: lon };
        setCoordinates(newCoords);
        fetchWeatherData(newCoords);
        return;
      }
    }
    setError('Invalid format. Please use "latitude,longitude" (e.g., "28.61,77.23").');
    toast({
        variant: 'destructive',
        title: 'Invalid Location Format',
        description: 'Please enter coordinates as "latitude,longitude".',
    });
  };

  const getGPSLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      toast({ variant: 'destructive', title: 'Geolocation Not Supported'});
      return;
    }
    setIsLoadingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(newCoords);
        setLocationInput(`${newCoords.latitude.toFixed(4)}, ${newCoords.longitude.toFixed(4)}`);
        fetchWeatherData(newCoords);
        setIsLoadingLocation(false);
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        toast({ variant: 'destructive', title: 'Location Error', description: err.message });
        setIsLoadingLocation(false);
      }
    );
  }, [fetchWeatherData, toast]);

  useEffect(() => {
    if (!OPENWEATHERMAP_API_KEY) {
      const apiKeyError = "CRITICAL: OpenWeatherMap API key is not configured. Please set the NEXT_PUBLIC_OPENWEATHERMAP_API_KEY environment variable for the weather feature to work.";
      setError(apiKeyError);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: apiKeyError,
        duration: Infinity, 
      });
    }
  }, [toast]);

  const disableActions = isLoadingData || isLoadingLocation || !OPENWEATHERMAP_API_KEY;

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Weather Information"
        description="Get current weather conditions and alerts for your location (powered by OpenWeatherMap)."
        actions={coordinates && (
          <Button onClick={() => coordinates && fetchWeatherData(coordinates)} variant="outline" disabled={disableActions}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        )}
      />

      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline">Set Your Location</CardTitle>
          <CardDescription>Enter latitude and longitude (e.g., for New Delhi: 28.61,77.23) or use GPS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleManualLocationSubmit} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            <div className="flex-grow">
              <Label htmlFor="location-input">Latitude,Longitude</Label>
              <Input
                id="location-input"
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g., 28.6139,77.2090"
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={disableActions || !locationInput.trim()} className="w-full md:w-auto">
              {isLoadingData && coordinates && locationInput.startsWith(String(coordinates.latitude)) ? ( 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Get Weather
            </Button>
          </form>
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>
          <Button onClick={getGPSLocation} variant="outline" className="w-full" disabled={disableActions}>
            {isLoadingLocation ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="mr-2 h-4 w-4" />
            )}
            Use My Current Location
          </Button>
        </CardContent>
      </Card>
      
      {error && (
         <Card className="mb-8 border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
            {error.toLowerCase().includes("api key") && (
                <p className="text-xs text-destructive mt-2">
                    Please verify your OpenWeatherMap API key in the <code>.env</code> file and restart your development server.
                </p>
            )}
          </CardContent>
        </Card>
      )}

      {isLoadingData && (
        <div className="space-y-6">
          <Card className="shadow-lg animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-5 bg-muted rounded w-1/3"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map(i => (
              <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoadingData && coordinates && !error && OPENWEATHERMAP_API_KEY && (
        <div className="space-y-8">
          {currentWeather && <CurrentWeatherDisplay weather={currentWeather} />}
          
          {alerts.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold font-headline mb-4 mt-8 flex items-center">
                <AlertTriangle className="mr-3 h-6 w-6 text-orange-500" />
                Active Weather Alerts
              </h2>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {alerts.map((alert) => (
                  <WeatherAlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {!currentWeather && alerts.length === 0 && (
             <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-off mx-auto text-muted-foreground mb-4"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><path d="m2 2 20 20"/></svg>
                <p className="text-xl font-semibold">No Data Available</p>
                <p className="text-muted-foreground mt-1">
                  Could not fetch current weather or alerts for the selected location.
                </p>
            </div>
          )}

           {currentWeather && alerts.length === 0 && (
            <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check mx-auto text-primary mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              <p className="text-xl font-semibold">No Active Alerts</p>
              <p className="text-muted-foreground mt-1">
                No active weather alerts from OpenWeatherMap for the selected location. Current weather is displayed above.
              </p>
            </div>
          )}
        </div>
      )}
      
       {!isLoadingData && !coordinates && !error && OPENWEATHERMAP_API_KEY && (
         <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin mx-auto text-primary mb-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <p className="text-xl font-semibold">Enter Location for Weather Info</p>
            <p className="text-muted-foreground mt-1">
              Please provide your location above to fetch current weather and alerts.
            </p>
        </div>
      )}
    </div>
  );
}
    
