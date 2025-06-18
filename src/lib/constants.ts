import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, BarChart3, Leaf, CloudSun, BookOpen, Microscope, DollarSign, CalendarDays } from 'lucide-react';

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
  { href: '/crop-price-prediction', label: 'Price Prediction', icon: DollarSign },
  { href: '/crop-disease-detection', label: 'Disease Detection', icon: Microscope },
  { href: '/farming-calendar', label: 'Farming Calendar', icon: CalendarDays },
  { href: '/weather', label: 'Weather Alerts', icon: CloudSun },
  { href: '/best-practices', label: 'Best Practices', icon: BookOpen },
];
