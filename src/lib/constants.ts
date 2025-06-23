
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, BarChart3, Leaf, CloudSun, BookOpen, Microscope, IndianRupee, CalendarDays, Calculator, Droplets, Bookmark } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: "View your personalized farming hub." },
  { href: '/yield-prediction', label: 'Yield Prediction', icon: BarChart3, description: "Forecast crop yields based on location and data." },
  { href: '/crop-recommendation', label: 'Crop Recommendation', icon: Leaf, description: "Get tailored crop suggestions for your soil." },
  { href: '/crop-price-prediction', label: 'Price Prediction', icon: IndianRupee, description: "Estimate future market prices for your crops." },
  { href: '/crop-health', label: 'Crop Health Analysis', icon: Microscope, description: "Diagnose diseases and pests from images." },
  { href: '/farming-calendar', label: 'Farming Calendar', icon: CalendarDays, description: "Generate a personalized activity schedule." },
  { href: '/irrigation-management', label: 'Irrigation Management', icon: Droplets, description: "Optimize your watering schedule for 5 days." },
  { href: '/cost-calculator', label: 'Cost Calculator', icon: Calculator, description: "Estimate expenses and potential profits." },
  { href: '/weather', label: 'Weather Alerts', icon: CloudSun, description: "Get detailed current and future forecasts." },
  { href: '/best-practices', label: 'Best Practices', icon: BookOpen, description: "Explore articles and news on innovations." },
  { href: '/saved', label: 'Saved Items', icon: Bookmark, description: "Review all your saved reports and analyses." },
];
