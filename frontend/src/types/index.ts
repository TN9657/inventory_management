export interface Supplier {
  id: number;
  name: string;
  gst: string;
  address: string;
  email: string;
  phone: string;
  company_name: string;
  created_at: string;
}

export interface MaterialName {
  id: number;
  name: string;
  created_at: string;
}

export interface MaterialItem {
  id?: number;
  material_name_id: number;
  material_name?: string;
  quantity: number;
  unit: 'kg' | 'liters' | 'packets' | 'units';
  cost: number;
  cost_per_item: number;
}

export interface Material {
  id: number;
  supplier_id: number;
  supplier_name: string;
  date: string;
  tax: number;
  total_cost: number;
  items?: MaterialItem[];
  created_at: string;
}

export interface MaterialListItem {
  id: number;
  material_name_id: number;
  material_name: string;
  cost_price: number;
  sell_price: number;
  total_quantity: number;
  unit: 'kg' | 'liters' | 'packets' | 'units';
  total_cost_price: number;
  total_selling_price: number;
  total_profit_price: number;
}

export interface BillingItem {
  id?: number;
  material_name_id: number;
  material_name?: string;
  selling_price: number;
  quantity: number;
  unit: 'kg' | 'liters' | 'packets' | 'units';
  total_amount: number;
}

export interface Billing {
  id: number;
  customer_name: string;
  date: string;
  total_amount: number;
  paid_amount: number;
  is_paid: boolean;
  items?: BillingItem[];
  created_at: string;
}

export interface DashboardData {
  todayProfit: number;
  dailyProfit: Array<{ date: string; profit: number }>;
  monthlyProfit: Array<{ year: number; month: number; profit: number }>;
  yearlyProfit: Array<{ year: number; profit: number }>;
  lifetimeProfit: number;
  lowStockAlerts: MaterialListItem[];
  todaySales: { bills: number; revenue: number };
}