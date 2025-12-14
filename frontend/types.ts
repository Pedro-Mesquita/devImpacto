export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: 'available' | 'reserved' | 'collected' | 'expired';
  marketPrice: number;
  socialPrice: number;
}

export interface StatMetric {
  label: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: string;
}

export interface Offer {
  id: string;
  product: string;
  quantity: string;
  expiry: string;
  supplier: string;
  distance: string;
  pickupWindow: string;
  isUrgent: boolean;
}

export type UserRole = 'public' | 'market' | 'ngo' | 'beneficiary' | 'admin';
