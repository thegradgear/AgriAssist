
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { WeatherAlertCard, type WeatherAlert } from '@/components/weather/WeatherAlertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, LocateFixed, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const isValidLatitude = (lat: number) => lat >= -90 && lat <= 90;
const isValidLongitude = (lon: number) => lon >= -180 && lon <= 180;

// IMPORTANT: Replace this with your actual OpenWeatherMap API key
// You should store this in an environment variable, e.g., process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || "YOUR_OPENWEATHERMAP_API_KEY";


export default function WeatherPage() {
  const [locationInput, setLocationInput] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mapOpenWeatherMapAlert = (alertData: any, index: number): WeatherAlert => {
    // Basic severity inference - OpenWeatherMap doesn't have a direct severity field like NWS
    // This is a simplistic example; you might need more sophisticated logic based on 'tags' or event names
    let severity: WeatherAlert['severity'] = 'Moderate'; // Default
    const eventLower = alertData.event?.toLowerCase() || "";
    if (eventLower.includes('warning')) severity = 'High';
    if (eventLower.includes('watch') || eventLower.includes('advisory')) severity = 'Moderate';
    if (eventLower.includes('statement')) severity = 'Low';


    return {
      id: `${alertData.event?.replace(/\s+/g, '-') || 'alert'}-${index}`, // Create a simple ID
      event: alertData.event || "Weather Alert",
      severity: severity,
      headline: alertData.description || "Important weather information.", // OWM description is more like a headline
      description: alertData.description || "Details not available.", // OWM description is often the main content
      instruction: alertData.instruction || undefined, // OWM doesn't typically provide specific instructions
      sent: alertData.start ? new Date(alertData.start * 1000).toISOString() : new Date().toISOString(),
      effective: alertData.start ? new Date(alertData.start * 1000).toISOString() : new Date().toISOString(),
      expires: alertData.end ? new Date(alertData.end * 1000).toISOString() : undefined,
      areaDesc: coordinates ? `Around Lat: ${coordinates.latitude.toFixed(2)}, Lon: ${coordinates.longitude.toFixed(2)}` : "Selected area",
      senderName: alertData.sender_name || "Weather Service",
      tags: alertData.tags || [],
    };
  };

  const fetchWeatherAlerts = useCallback(async (coords: Coordinates) => {
    if (!coords) return;

    if (OPENWEATHERMAP_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
        setError("OpenWeatherMap API key is not configured. Please set it in the code or environment variable.");
        toast({
            variant: "destructive",
            title: "API Key Missing",
            description: "OpenWeatherMap API key is not configured.",
        });
        setIsLoadingAlerts(false);
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
      setIsLoadingAlerts(false);
      setAlerts([]);
      return;
    }

    setIsLoadingAlerts(true);
    setError(null);
    setAlerts([]);

    try {
      // Using OpenWeatherMap One Call API (v3.0 often preferred for new integrations)
      // We exclude other parts to focus on alerts if available.
      // Note: `alerts` might not always be present or detailed depending on location and events.
      const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${coords.latitude}&lon=${coords.longitude}&exclude=minutely,hourly,daily,current&appid=${OPENWEATHERMAP_API_KEY}`);
      
      if (!response.ok) {
        let errorMsg = `Error fetching alerts: ${response.statusText} (${response.status})`;
         try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg; // OpenWeatherMap often uses 'message'
        } catch (e) {
            // Failed to parse error JSON
        }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      if (data.alerts && data.alerts.length > 0) {
        const mappedAlerts = data.alerts.map(mapOpenWeatherMapAlert)
          .sort((a: WeatherAlert, b: WeatherAlert) => new Date(b.sent).getTime() - new Date(a.sent).getTime());
        setAlerts(mappedAlerts);
         toast({
            title: 'Weather Alerts Updated',
            description: `${mappedAlerts.length} alerts found for this location.`,
        });
      } else {
        setAlerts([]);
        toast({
            title: 'No Active Alerts',
            description: 'No active weather alerts reported by OpenWeatherMap for this location.',
        });
      }
    } catch (err: any) {
      console.error("Fetch weather alerts error:", err);
      setError(err.message || 'Failed to fetch weather alerts.');
      toast({
        variant: 'destructive',
        title: 'Error Fetching Alerts',
        description: err.message || 'Could not retrieve weather alerts. Check your API key or network.',
      });
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [toast]);

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
        fetchWeatherAlerts(newCoords);
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
        fetchWeatherAlerts(newCoords);
        setIsLoadingLocation(false);
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        toast({ variant: 'destructive', title: 'Location Error', description: err.message });
        setIsLoadingLocation(false);
      }
    );
  }, [fetchWeatherAlerts, toast]);

  useEffect(() => {
    if (OPENWEATHERMAP_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
      setError("CRITICAL: OpenWeatherMap API key is not configured in the application. Please replace the placeholder value with your actual API key for the weather feature to work.");
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "OpenWeatherMap API key is missing. Weather alerts will not function.",
        duration: Infinity, 
      });
    }
  }, []);


  return (
    <div className="container mx-auto">
      <PageHeader
        title="Weather Alerts"
        description="Get weather alerts for your location (powered by OpenWeatherMap)."
        actions={coordinates && (
          <Button onClick={() => coordinates && fetchWeatherAlerts(coordinates)} variant="outline" disabled={isLoadingAlerts}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingAlerts ? 'animate-spin' : ''}`} />
            Refresh Alerts
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
            <Button type="submit" disabled={isLoadingAlerts || !locationInput.trim() || OPENWEATHERMAP_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY"} className="w-full md:w-auto">
              {isLoadingAlerts && coordinates && locationInput.startsWith(coordinates.latitude.toString()) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Get Alerts
            </Button>
          </form>
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>
          <Button onClick={getGPSLocation} variant="outline" className="w-full" disabled={isLoadingLocation || isLoadingAlerts || OPENWEATHERMAP_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY"}>
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
          </CardContent>
        </Card>
      )}

      {isLoadingAlerts && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          ))}
        </div>
      )}

      {!isLoadingAlerts && alerts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <WeatherAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {!isLoadingAlerts && alerts.length === 0 && coordinates && !error && OPENWEATHERMAP_API_KEY !== "YOUR_OPENWEATHERMAP_API_KEY" && (
        <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check mx-auto text-primary mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          <p className="text-xl font-semibold">All Clear!</p>
          <p className="text-muted-foreground mt-1">
            No active weather alerts from OpenWeatherMap for the selected location.
          </p>
        </div>
      )}
       {!isLoadingAlerts && !coordinates && !error && OPENWEATHERMAP_API_KEY !== "YOUR_OPENWEATHERMAP_API_KEY" && (
         <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin mx-auto text-primary mb-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <p className="text-xl font-semibold">Enter Location for Alerts</p>
            <p className="text-muted-foreground mt-1">
              Please provide your location above to fetch weather alerts.
            </p>
        </div>
      )}
    </div>
  );
}
    

    