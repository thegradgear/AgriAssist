
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { WeatherAlertCard, type NWSWeatherAlert } from '@/components/weather/WeatherAlertCard';
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

export default function WeatherPage() {
  const [locationInput, setLocationInput] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [alerts, setAlerts] = useState<NWSWeatherAlert[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mapNWSAlert = (feature: any): NWSWeatherAlert => {
    const props = feature.properties;
    let severity: NWSWeatherAlert['severity'] = 'Low'; // Default
    if (props.severity === 'Minor') severity = 'Low';
    else if (props.severity === 'Moderate') severity = 'Moderate';
    else if (props.severity === 'Severe') severity = 'High';
    else if (props.severity === 'Extreme') severity = 'Critical';

    return {
      id: props.id,
      event: props.event,
      severity: severity,
      headline: props.headline,
      description: props.description,
      instruction: props.instruction,
      sent: props.sent,
      effective: props.effective,
      expires: props.expires,
      areaDesc: props.areaDesc,
      senderName: props.senderName,
    };
  };

  const fetchWeatherAlerts = useCallback(async (coords: Coordinates) => {
    if (!coords) return;

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
      const response = await fetch(`https://api.weather.gov/alerts/active?status=actual&point=${coords.latitude},${coords.longitude}`);
      
      if (!response.ok) {
        let errorMsg = `Error fetching alerts: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorData.title || errorMsg;
            if (errorData.status === 400 && errorData.detail?.toLowerCase().includes("out of bounds")) {
              errorMsg = "The provided location is outside the service area for weather alerts (typically US only) or the coordinates are invalid for the service.";
            }
        } catch (e) {
            // Failed to parse error JSON
        }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const mappedAlerts = data.features.map(mapNWSAlert)
          .sort((a: NWSWeatherAlert, b: NWSWeatherAlert) => new Date(b.sent).getTime() - new Date(a.sent).getTime());
        setAlerts(mappedAlerts);
      } else {
        setAlerts([]);
      }
      toast({
        title: 'Weather Alerts Updated',
        description: data.features?.length > 0 ? `${data.features.length} alerts found.` : 'No active alerts for this location.',
      });
    } catch (err: any) {
      console.error("Fetch weather alerts error:", err);
      setError(err.message || 'Failed to fetch weather alerts.');
      toast({
        variant: 'destructive',
        title: 'Error Fetching Alerts',
        description: err.message || 'Could not retrieve weather alerts. The NWS API might be temporarily unavailable or the location is outside the US.',
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
        fetchWeatherAlerts(newCoords); // Validation now happens inside fetchWeatherAlerts
        return;
      }
    }
    setError('Invalid format. Please use "latitude,longitude" (e.g., "40.71,-74.00").');
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

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Weather Alerts"
        description="Get real-time weather alerts for your location (US only)."
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
          <CardDescription>Enter latitude and longitude manually or use your device's GPS.</CardDescription>
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
                placeholder="e.g., 40.7128,-74.0060"
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={isLoadingAlerts || !locationInput.trim()} className="w-full md:w-auto">
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
          <Button onClick={getGPSLocation} variant="outline" className="w-full" disabled={isLoadingLocation || isLoadingAlerts}>
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

      {!isLoadingAlerts && alerts.length === 0 && coordinates && !error && (
        <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check mx-auto text-primary mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          <p className="text-xl font-semibold">All Clear!</p>
          <p className="text-muted-foreground mt-1">
            No active weather alerts for the selected location.
          </p>
        </div>
      )}
       {!isLoadingAlerts && !coordinates && !error && (
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
    
