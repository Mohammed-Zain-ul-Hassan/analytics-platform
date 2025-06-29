export interface TenantTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  // Dark mode variants
  dark: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  logo: string;
  domain: string;
  theme: TenantTheme;
  slug?: string;
  umamiWebsiteId?: string | null;
  settings?: {
    brandColor: string;
    [key: string]: any; // Allow for future settings
  };
  status?: string;
}

export interface MetricData {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: "increase" | "decrease";
  icon: string;
  trend: number[];
  realTime?: boolean;
}

export interface ChartData {
  id: string;
  title: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  type: "line" | "bar" | "donut";
  timeframe?: string;
}

export interface TopPage {
  path: string;
  views: number;
  change: number;
}

export interface RealTimeActivity {
  id: string;
  type: "pageview" | "session" | "conversion";
  page: string;
  location: string;
  timestamp: Date;
}

export interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface PayloadTenantResponse {
  id: string;
  name: string;
  slug: string;
  domain: string;
  umamiWebsiteId: string | null;
  theme: {
    primary: string;
  };
  settings: {
    brandColor: string;
  };
  status: string;
}
