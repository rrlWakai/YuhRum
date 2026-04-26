export type Room = {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string;
  price: string;
  ctaLabel: string;
  image: string;
};

export type Amenity = {
  id: string;
  title: string;
  text: string;
};

export type Booking = {
  id: string;
  guest_name: string;
  email: string;
  phone?: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
};

export type Discount = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  amount: number;
  is_active: boolean;
  created_at?: string;
};
