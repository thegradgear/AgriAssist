
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Calendar, CloudSun, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useCallback } from 'react';
import type { SavedLocation } from '@/app/(app)/weather/page';
import type { CurrentWeatherData } from '@/components/weather/CurrentWeatherDisplay';
import { db, collection, query, orderBy, limit, getDocs } from '@/lib/firebase';
import type { CalendarEvent } from '@/ai/flows/farming-calendar-flow';
import { format, parseISO, isFuture, startOfToday } from 'date-fns';
import Image from 'next/image';

const SkeletonDashboardCard = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-6 w-3/5" /> {/* CardTitle skeleton */}
      <Skeleton className="h-6 w-6 rounded-full" /> {/* Icon skeleton */}
    </CardHeader>
    <CardContent className="flex-grow">
      <Skeleton className="h-4 w-4/5" /> {/* CardDescription skeleton */}
    </CardContent>
    <CardContent className="pt-0">
      <Skeleton className="h-5 w-2/5" /> {/* Link text skeleton */}
    </CardContent>
  </Card>
);


// New Weather Widget Component
const WeatherWidget = () => {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeatherData = useCallback(async (loc: SavedLocation) => {
    setIsLoading(true);
    const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    if (!OPENWEATHERMAP_API_KEY) {
      console.error("Weather API key missing");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loc.latitude}&lon=${loc.longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      if (!response.ok) throw new Error("Failed to fetch weather");
      const data = await response.json();
      setWeather({
        cityName: loc.name,
        temperature: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feelsLike: data.main.feels_like,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        cloudiness: data.clouds.all,
        pressure: data.main.pressure,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const lastSelected = localStorage.getItem('lastSelectedLocation');
      if (lastSelected) {
        const parsedLocation = JSON.parse(lastSelected);
        fetchWeatherData(parsedLocation);
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  }, [fetchWeatherData]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
           <Skeleton className="h-10 w-1/2" />
           <Skeleton className="h-12 w-12 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
       <Card className="h-full flex flex-col justify-between group hover:border-primary transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><CloudSun className="mr-2 h-5 w-5"/>Live Weather</CardTitle>
          <CardDescription>No location set</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Go to the Weather page to set a location and see live conditions here.</p>
        </CardContent>
        <CardContent className="pt-0">
          <Link href="/weather" className="text-sm font-medium text-primary flex items-center">
            <span className="group-hover:underline">Set Location</span> <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
     <Card className="h-full flex flex-col justify-between group hover:border-primary transition-all hover:shadow-lg">
      <CardHeader>
         <CardTitle className="font-headline flex items-center"><CloudSun className="mr-2 h-5 w-5"/>{weather.cityName}</CardTitle>
         <CardDescription>Current Conditions</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex flex-col">
            <span className="text-4xl font-bold">{Math.round(weather.temperature)}°C</span>
            <span className="text-sm text-muted-foreground capitalize">{weather.description}</span>
        </div>
        <div className="relative h-16 w-16">
            <Image
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                layout="fill"
                objectFit="contain"
            />
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <Link href="/weather" className="text-sm font-medium text-primary flex items-center">
            <span className="group-hover:underline">View Full Forecast</span> <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
};


// New Calendar Widget Component
const CalendarWidget = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchCalendar = async () => {
      setIsLoading(true);
      try {
        const calendarsRef = collection(db, 'users', user.uid, 'farmingCalendars');
        const q = query(calendarsRef, orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const calendarDoc = snapshot.docs[0].data();
          const schedule = calendarDoc.results.schedule as CalendarEvent[];
          const today = startOfToday();
          const upcoming = schedule
            .filter(task => isFuture(parseISO(task.startDate)) || format(parseISO(task.startDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
          
          setTasks(upcoming.slice(0, 2));
        }
      } catch (error) {
        console.error("Error fetching calendar tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendar();
  }, [user]);

  if (isLoading) {
     return (
      <Card className="h-full lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col justify-between lg:col-span-2 group hover:border-primary transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><Calendar className="mr-2 h-5 w-5"/>Upcoming Tasks</CardTitle>
        <CardDescription>From your most recent farming calendar.</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.eventName} className="flex items-start gap-3 p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center pt-1">
                    <span className="font-bold text-primary text-lg">{format(parseISO(task.startDate), 'dd')}</span>
                    <span className="text-xs text-muted-foreground -mt-1">{format(parseISO(task.startDate), 'MMM')}</span>
                </div>
                <div>
                    <p className="font-medium">{task.eventName}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming tasks found. Create a new calendar to get started.</p>
        )}
      </CardContent>
      <CardContent className="pt-0">
          <Link href="/saved" className="text-sm font-medium text-primary flex items-center">
            <span className="group-hover:underline">Go to Calendar</span> <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
};


export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticating } = useAuth();
  const features = NAV_ITEMS.filter(item => !['/dashboard', '/profile', '/saved'].includes(item.href));

  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Farmer';
    return name.split(' ')[0];
  };
  
  const displayName = user?.name ? getFirstName(user.name) : (user?.email ? getFirstName(user.email.split('@')[0]) : 'Farmer');

  if (authLoading || isAuthenticating) {
    return (
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
            <div className="grid gap-1">
              <Skeleton className="h-9 w-1/2 md:w-1/3" />
              <Skeleton className="h-5 w-3/4 md:w-1/2" />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg lg:col-span-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(features.length + 1)].map((_, index) => (
            <SkeletonDashboardCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title={`Welcome, ${displayName}!`}
        description="Your AgriAssist dashboard for smart farming."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <WeatherWidget />
        <CalendarWidget />
      </div>
      
      <h2 className="text-2xl font-semibold font-headline mb-4">Explore Tools</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group block h-full">
            <Card className="h-full flex flex-col justify-between hover:border-primary transition-all duration-300 hover:shadow-xl rounded-lg group-hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline group-hover:text-primary transition-colors">{feature.label}</CardTitle>
                  <feature.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="!mt-4">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <div className="text-sm font-medium text-primary flex items-center">
                  Open Tool
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
