
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, BarChart3, Leaf, CloudSun, BookOpen, Microscope, IndianRupee, CalendarDays, Calculator, Droplets, Landmark } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/yield-prediction', label: 'Yield Prediction', icon: BarChart3 },
  { href: '/crop-recommendation', label: 'Crop Recommendation', icon: Leaf },
  { href: '/crop-price-prediction', label: 'Price Prediction', icon: IndianRupee },
  { href: '/mandi-prices', label: 'Mandi Prices', icon: Landmark },
  { href: '/crop-disease-detection', label: 'Crop Health Analysis', icon: Microscope },
  { href: '/farming-calendar', label: 'Farming Calendar', icon: CalendarDays },
  { href: '/irrigation-management', label: 'Irrigation Management', icon: Droplets },
  { href: '/cost-calculator', label: 'Cost Calculator', icon: Calculator },
  { href: '/weather', label: 'Weather Alerts', icon: CloudSun },
  { href: '/best-practices', label: 'Best Practices', icon: BookOpen },
];
