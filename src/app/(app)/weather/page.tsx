'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { WeatherAlertCard, type WeatherAlert } from '@/components/weather/WeatherAlertCard';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Mock data for weather alerts - replace with actual API calls
const mockAlerts: WeatherAlert[] = [
  {
    id: '1',
    type: 'Extreme Heat',
    severity: 'High',
    title: 'Heatwave Warning',
    description: 'Temperatures expected to exceed 40°C for the next 3 days.',
    advice: 'Ensure adequate irrigation for crops. Avoid strenuous outdoor activity during peak sun hours. Provide shade for vulnerable livestock.',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    type: 'Heavy Rainfall',
    severity: 'Moderate',
    title: 'Heavy Rain Forecast',
    description: 'Possibility of heavy showers and localized waterlogging in the afternoon.',
    advice: 'Check drainage systems. Postpone spraying or fertilizing if rain is imminent. Secure loose items.',
    timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    type: 'Strong Winds',
    severity: 'Low',
    title: 'Gusty Winds Expected',
    description: 'Winds may reach speeds of 20-30 km/h later today.',
    advice: 'Check for loose structures or materials. Young or tall crops might need support.',
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // 1 day ago
  },
];

export default function WeatherPage() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<WeatherAlert['severity'] | 'All'>('All');

  const fetchAlerts = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAlerts(mockAlerts.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => 
    filterSeverity === 'All' || alert.severity === filterSeverity
  );

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Weather Alerts"
        description="Stay updated with the latest weather conditions and advisories for your farm."
        actions={
          <div className="flex items-center gap-2">
            <Select value={filterSeverity} onValueChange={(value) => setFilterSeverity(value as WeatherAlert['severity'] | 'All')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Severities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAlerts} variant="outline" disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />
      {isLoading ? (
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
      ) : filteredAlerts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlerts.map((alert) => (
            <WeatherAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-sun mx-auto text-muted-foreground mb-4"><path d="M12 16.5V22"/><path d="M12 2v4.5"/><path d="M4.2 10.2 2 12"/><path d="m22 12-2.2-1.8"/><path d="M20 20.2 17.5 18"/><path d="M6.5 18 4 20.2"/><path d="M18 7H6.2c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5h.3A3.2 3.2 0 0 0 6 15c0 1.6 1.4 3 3 3h5c1.7 0 3-1.3 3-3s-1.3-3-3-3h-1a3.5 3.5 0 0 0-3.5-3.5Z"/></svg>
          <p className="text-lg font-medium">No Weather Alerts</p>
          <p className="text-muted-foreground">
            {filterSeverity === 'All' ? 'There are currently no active weather alerts.' : `No alerts matching '${filterSeverity}' severity.`}
          </p>
        </div>
      )}
    </div>
  );
}
