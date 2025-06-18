
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, BarChart3, Leaf, CloudSun, BookOpen, UserSquare } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // { href: '/profile', label: 'My Profile', icon: UserSquare }, // Removed from main navigation
  { href: '/yield-prediction', label: 'Yield Prediction', icon: BarChart3 },
  { href: '/crop-recommendation', label: 'Crop Recommendation', icon: Leaf },
  { href: '/weather', label: 'Weather Alerts', icon: CloudSun },
  { href: '/best-practices', label: 'Best Practices', icon: BookOpen },
];

