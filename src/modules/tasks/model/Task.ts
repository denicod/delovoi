export interface Task {
  description: string | null;
  address_full: string;
  customer_name: string;
  id: number;
  time_start: string;
  time_end: string;
  gps: string;
  price: number;
  sum_shift: number;
  vacancy: string;
  customer_logo: string;
  base_id: number;
  special_conditions: string;
  payment: string;
  medbook: number;
  order_date: string;
  object: string;
  meals: number;
  status: string;
  driveway: number;
  task_type: string;
  latitude: string;
  longitude: string;
}
