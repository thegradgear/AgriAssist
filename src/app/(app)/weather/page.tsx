
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { WeatherAlertCard, type WeatherAlert } from '@/components/weather/WeatherAlertCard';
import { CurrentWeatherDisplay, type CurrentWeatherData } from '@/components/weather/CurrentWeatherDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, RefreshCw, AlertTriangle, CloudSun, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PlaceSuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  displayName: string;
}

// Ensure CurrentWeatherData interface here includes all fields for localStorage and state
interface ExtendedCurrentWeatherData extends CurrentWeatherData {
  sunrise: number; // Unix timestamp
  sunset: number; // Unix timestamp
  cloudiness: number; // Percentage
  pressure: number; // hPa
}


const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

export default function WeatherPage() {
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [currentWeather, setCurrentWeather] = useState<ExtendedCurrentWeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  
  const [isLoadingWeatherData, setIsLoadingWeatherData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsBoxRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);


  const mapOpenWeatherMapAlert = (alertData: any, index: number): WeatherAlert => {
    let severity: WeatherAlert['severity'] = 'Moderate'; // Default severity
    const eventLower = alertData.event?.toLowerCase() || "";

    // Infer severity based on keywords, this is a heuristic
    if (eventLower.includes('warning')) severity = 'High';
    else if (eventLower.includes('watch') || eventLower.includes('advisory') || eventLower.includes('statement')) severity = 'Moderate';
    else if (eventLower.includes('emergency')) severity = 'Critical';
    else if (eventLower.includes('information') || eventLower.includes('notice')) severity = 'Low';


    return {
      id: `${alertData.event?.replace(/\s+/g, '-') || 'alert'}-${index}`,
      event: alertData.event || "Weather Alert",
      severity: severity,
      headline: alertData.description || "Important weather information.", // Using OWM description as headline
      description: alertData.description || "Details not available.",
      instruction: alertData.instruction || "Take necessary precautions.", // Generic instruction if not provided
      sent: alertData.start ? new Date(alertData.start * 1000).toISOString() : new Date().toISOString(),
      effective: alertData.start ? new Date(alertData.start * 1000).toISOString() : new Date().toISOString(),
      expires: alertData.end ? new Date(alertData.end * 1000).toISOString() : undefined,
      areaDesc: selectedCoordinates ? `Around Lat: ${selectedCoordinates.latitude.toFixed(2)}, Lon: ${selectedCoordinates.longitude.toFixed(2)}` : "Selected area",
      senderName: alertData.sender_name || "Weather Service",
      tags: alertData.tags || [],
    };
  };

  const fetchWeatherData = useCallback(async (coords: Coordinates) => {
    if (!OPENWEATHERMAP_API_KEY) {
      setError("OpenWeatherMap API key is not configured. Please set NEXT_PUBLIC_OPENWEATHERMAP_API_KEY in your .env file and restart the server.");
      setIsLoadingWeatherData(false);
      return;
    }

    if (coords.latitude < -90 || coords.latitude > 90 || coords.longitude < -180 || coords.longitude > 180) {
      setError("Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.");
      setIsLoadingWeatherData(false);
      return;
    }

    setIsLoadingWeatherData(true);
    setError(null);

    try {
      // Use /data/2.5/weather endpoint which is generally available on free tiers
      // and can include alerts if available.
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      
      if (!response.ok) {
        let errorMsg = `Error fetching weather data: ${response.statusText} (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
            if (errorData.cod === 401) { // Unauthorized - typically API key issue
                 errorMsg = "Invalid API key. Please check your OpenWeatherMap API key.";
            } else if (errorData.cod === 404) { // Not Found
                 errorMsg = `Weather data not found for the specified location (Lat: ${coords.latitude}, Lon: ${coords.longitude}).`;
            } else if (errorData.cod === 429) { // Too many requests
                 errorMsg = "API rate limit exceeded. Please try again later.";
            }
          }
        } catch (e) {
            // Failed to parse error JSON, stick with the statusText
        }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      
      let mappedCurrentWeather: ExtendedCurrentWeatherData | null = null;
      if (data.weather && data.weather.length > 0 && data.main && data.sys) {
        mappedCurrentWeather = {
          cityName: data.name,
          temperature: data.main.temp,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          feelsLike: data.main.feels_like,
          sunrise: data.sys.sunrise, // Unix timestamp UTC
          sunset: data.sys.sunset,   // Unix timestamp UTC
          cloudiness: data.clouds?.all || 0, // Percentage
          pressure: data.main.pressure, // hPa
        };
      }
      setCurrentWeather(mappedCurrentWeather);

      let mappedAlerts: WeatherAlert[] = [];
      // OpenWeatherMap's /weather endpoint may not have rich alerts or any alerts.
      // The 'alerts' field is not standard on this endpoint unlike the OneCall API.
      // This is an optimistic check. If their /weather endpoint *does* include an `alerts` array.
      if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
        mappedAlerts = data.alerts.map(mapOpenWeatherMapAlert)
          .sort((a: WeatherAlert, b: WeatherAlert) => new Date(b.sent).getTime() - new Date(a.sent).getTime());
      }
      setAlerts(mappedAlerts);
      
      // Save to localStorage
      localStorage.setItem('weatherCoordinates', JSON.stringify(coords));
      if (mappedCurrentWeather) localStorage.setItem('currentWeather', JSON.stringify(mappedCurrentWeather)); else localStorage.removeItem('currentWeather');
      localStorage.setItem('weatherAlerts', JSON.stringify(mappedAlerts));
      // Save last searched city name if cityInput was used and weather was found
      if (cityInput && mappedCurrentWeather) localStorage.setItem('lastSearchedCityName', mappedCurrentWeather.cityName || cityInput)


      if (mappedCurrentWeather) {
         toast({ title: 'Weather Data Updated', description: `Current weather for ${mappedCurrentWeather.cityName} fetched.`});
      } else {
         toast({ variant: 'destructive', title: 'Weather Data Issue', description: 'Could not fetch complete weather information.'});
      }

    } catch (err: any) {
      console.error("Fetch weather data error:", err);
      const errorMessage = err.message || 'Failed to fetch weather data.';
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Fetching Data', description: `${errorMessage}` });
    } finally {
      setIsLoadingWeatherData(false);
    }
  }, [toast, cityInput]);

  const fetchPlaceSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (!OPENWEATHERMAP_API_KEY) {
      const errorMsg = "OpenWeatherMap API key is not configured for geocoding. Please set NEXT_PUBLIC_OPENWEATHERMAP_API_KEY.";
      setError(errorMsg);
      toast({ variant: 'destructive', title: 'Configuration Error', description: errorMsg });
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setError(null); // Clear previous errors related to suggestions
    try {
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHERMAP_API_KEY}`);
      if (!response.ok) {
        let errorMsg = `Error fetching suggestions: ${response.statusText} (${response.status})`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                errorMsg = errorData.message;
                if (response.status === 401) {
                     errorMsg = "Invalid API key for geocoding. Please check your OpenWeatherMap API key.";
                } else if (response.status === 429) {
                     errorMsg = "Geocoding API rate limit exceeded. Please try again later.";
                }
            }
        } catch (e) { /* Failed to parse JSON, stick with statusText */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      const mappedSuggestions: PlaceSuggestion[] = data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon,
        displayName: `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`
      }));
      setSuggestions(mappedSuggestions);
      setShowSuggestions(mappedSuggestions.length > 0);
    } catch (err: any) {
      console.error("Fetch suggestions error:", err);
      const errorMessage = err.message || 'Failed to fetch place suggestions.';
      setError(errorMessage); // Set the page-level error
      toast({ variant: 'destructive', title: 'Suggestion Error', description: errorMessage });
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [toast]); // Added toast as a dependency

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Only fetch suggestions if we are intending to show them (i.e., user is typing)
    // and the input is long enough. This prevents fetching on initial page load
    // when cityInput is populated from localStorage.
    if (showSuggestions && cityInput.trim().length > 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        fetchPlaceSuggestions(cityInput);
      }, 500);
    } else {
      // If we are not meant to show suggestions, just clear the suggestions list.
      // Don't modify `showSuggestions` here to avoid potential loops.
      setSuggestions([]);
    }
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [cityInput, fetchPlaceSuggestions, showSuggestions]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCityName = localStorage.getItem('lastSearchedCityName');
      const storedCoordsStr = localStorage.getItem('weatherCoordinates');
      if (storedCityName && storedCoordsStr) {
        const storedCoords = JSON.parse(storedCoordsStr);
        setCityInput(storedCityName); // Set city input to the stored name
        setSelectedCoordinates(storedCoords); // Set coordinates for potential refresh
        
        // Load stored weather and alerts directly without re-fetching initially
        const storedCurrentWeatherStr = localStorage.getItem('currentWeather');
        if (storedCurrentWeatherStr) setCurrentWeather(JSON.parse(storedCurrentWeatherStr) as ExtendedCurrentWeatherData);
        const storedAlertsStr = localStorage.getItem('weatherAlerts');
        if (storedAlertsStr) setAlerts(JSON.parse(storedAlertsStr));

      }
    } catch (e) {
      console.error("Error loading from localStorage", e);
      // Clear potentially corrupted localStorage items
      localStorage.removeItem('lastSearchedCityName');
      localStorage.removeItem('weatherCoordinates');
      localStorage.removeItem('currentWeather');
      localStorage.removeItem('weatherAlerts');
    }
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (!OPENWEATHERMAP_API_KEY) {
      setError("CRITICAL: OpenWeatherMap API key is not configured. Please set NEXT_PUBLIC_OPENWEATHERMAP_API_KEY in your .env file and restart your development server.");
      toast({ variant: "destructive", title: "Configuration Error", description: "OpenWeatherMap API key missing. Weather functionality will be disabled.", duration: Infinity });
    }
  }, [toast]);
  
  const handleSuggestionClick = (suggestion: PlaceSuggestion) => {
    setCityInput(suggestion.displayName); // Update input field to full suggested name
    const coords = { latitude: suggestion.lat, longitude: suggestion.lon };
    setSelectedCoordinates(coords);
    setSuggestions([]); // Clear suggestions
    setShowSuggestions(false); // Hide suggestions box
    fetchWeatherData(coords); // Fetch weather for the selected suggestion
  };
  
  const handleManualCitySearch = async () => {
    if (!cityInput.trim()) {
      setError("Please enter a city name.");
      toast({variant: 'destructive', title: 'Input Required', description: "City name cannot be empty."});
      return;
    }
    if (!OPENWEATHERMAP_API_KEY) {
      setError("OpenWeatherMap API key is not configured for geocoding.");
      toast({variant: 'destructive', title: 'Configuration Error', description: "OpenWeatherMap API key missing."});
      return;
    }
    setIsLoadingWeatherData(true); // Indicate loading for geocoding + weather fetch
    setError(null);
    try {
      // First, geocode the cityInput to get lat/lon
      const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityInput)}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`);
      if (!geoResponse.ok) {
        let errorMsg = `Failed to geocode city '${cityInput}': ${geoResponse.statusText} (${geoResponse.status})`;
          try {
              const errorData = await geoResponse.json();
              if (errorData && errorData.message) {
                  errorMsg = errorData.message;
                  if (geoResponse.status === 401) {
                       errorMsg = "Invalid API key for geocoding. Please check your OpenWeatherMap API key.";
                  } else if (geoResponse.status === 429) {
                       errorMsg = "Geocoding API rate limit exceeded. Please try again later.";
                  } else if (geoResponse.status === 404 && errorData.message === "city not found") {
                       errorMsg = `Could not find location: ${cityInput}. Please check the spelling or try a nearby city.`;
                  }
              }
          } catch(e) { /* stick to statusText or original message */ }
          throw new Error(errorMsg);
      }
      const geoData = await geoResponse.json();
      if (geoData.length === 0) {
        const notFoundError = `Could not find location: ${cityInput}. Please check the spelling or try a different name.`;
        setError(notFoundError);
        toast({variant: 'destructive', title: 'Location Not Found', description: notFoundError});
        setIsLoadingWeatherData(false);
        setCurrentWeather(null); // Clear previous weather if location not found
        setAlerts([]);
        return;
      }
      const { lat, lon, name, country, state } = geoData[0];
      const coords = { latitude: lat, longitude: lon };
      setSelectedCoordinates(coords);
      // Update cityInput to the name returned by geocoding API for consistency
      const consistentCityName = `${name}${state ? ', ' + state : ''}, ${country}`;
      setCityInput(consistentCityName); 
      localStorage.setItem('lastSearchedCityName', consistentCityName); // Save the consistent name
      fetchWeatherData(coords); // Now fetch weather with the obtained coordinates
    } catch (err: any) {
      console.error("Geocoding or weather fetch error:", err);
      const errorMessage = err.message || "Failed to get weather for the city.";
      setError(errorMessage);
      toast({variant: 'destructive', title: 'Search Failed', description: errorMessage});
      setIsLoadingWeatherData(false);
    }
    setShowSuggestions(false); // Hide suggestions after search attempt
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsBoxRef.current && !suggestionsBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const disableActions = isLoadingWeatherData || isLoadingSuggestions || !OPENWEATHERMAP_API_KEY;

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Weather Information"
        description="Get current weather and alerts by city name (powered by OpenWeatherMap)."
        actions={selectedCoordinates && (
          <Button onClick={() => selectedCoordinates && fetchWeatherData(selectedCoordinates)} variant="outline" disabled={disableActions || isLoadingWeatherData} suppressHydrationWarning>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingWeatherData ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        )}
      />

      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline">Enter City Name</CardTitle>
          <CardDescription>Type a city name to get weather information and suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex-grow relative" ref={suggestionsBoxRef}>
              <Label htmlFor="city-input" className="sr-only">City Name</Label>
              <Input
                id="city-input"
                type="text"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  // Show suggestions if input is long enough, otherwise hide
                  if (e.target.value.trim().length > 2) setShowSuggestions(true); else setShowSuggestions(false);
                }}
                onFocus={() => cityInput.trim().length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="e.g., London, New Delhi, Tokyo"
                className="pr-10" // Make space for loader
                suppressHydrationWarning
              />
              {isLoadingSuggestions && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <ul>
                    {suggestions.map((s, index) => (
                      <li
                        key={`${s.lat}-${s.lon}-${index}`} // Ensure unique key
                        className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s.displayName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button onClick={handleManualCitySearch} disabled={disableActions || !cityInput.trim() || isLoadingWeatherData} suppressHydrationWarning>
              {isLoadingWeatherData && !isLoadingSuggestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-0 md:mr-2 h-4 w-4" />}
              <span className="hidden md:inline">Get Weather</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {error && (
         <Card className="mb-8 border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
            {(error.toLowerCase().includes("api key") || error.toLowerCase().includes("next_public_openweathermap_api_key")) && (
                <p className="text-xs text-destructive mt-2">
                    Please verify your OpenWeatherMap API key in your <code>.env</code> or <code>src/.env</code> file (as <code>NEXT_PUBLIC_OPENWEATHERMAP_API_KEY</code>) and restart your development server.
                </p>
            )}
          </CardContent>
        </Card>
      )}

      {isLoadingWeatherData && (
        <div className="space-y-6">
          {/* Skeleton for CurrentWeatherDisplay */}
          <Card className="shadow-lg animate-pulse">
            <CardHeader className="bg-primary/10 p-4 sm:p-6">
                <div className="h-6 bg-muted rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 p-4 bg-muted/50 rounded-md">
                    <div className="h-10 bg-muted rounded w-1/2"></div>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="space-y-3 p-4 bg-muted/50 rounded-md">
                    <div className="h-5 bg-muted rounded w-full"></div>
                    <div className="h-5 bg-muted rounded w-full"></div>
                    <div className="h-5 bg-muted rounded w-full"></div>
                    <div className="h-5 bg-muted rounded w-full"></div>
                </div>
            </CardContent>
          </Card>
          {/* Skeleton for WeatherAlertCard (if any expected) */}
           <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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

      {!isLoadingWeatherData && selectedCoordinates && !error && OPENWEATHERMAP_API_KEY && (
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
                No active weather alerts reported for this location. Current weather is displayed above.
              </p>
            </div>
          )}
        </div>
      )}
      
       {!isLoadingWeatherData && !selectedCoordinates && !error && OPENWEATHERMAP_API_KEY && (
         <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
            <MapPin className="mx-auto h-16 w-16 text-primary mb-4" />
            <p className="text-xl font-semibold">Enter City for Weather Info</p>
            <p className="text-muted-foreground mt-1">
              Please type a city name above to fetch current weather and alerts.
            </p>
        </div>
      )}
    </div>
  );
}
    

    
