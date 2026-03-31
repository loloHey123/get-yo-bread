export interface User {
  id: string;
  email: string;
  hourly_rate: number;
  expected_hours_per_week: number;
  location: string | null;
  created_at: string;
}

export interface Bread {
  id: string;
  nfc_uid: string;
  user_id: string | null;
  linked_at: string | null;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  earnings: number | null;
}

export interface Preferences {
  user_id: string;
  bakery_prefs: string[];
  allergies: string[];
}

export interface CuratedItem {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  tags: string[];
  allergens: string[];
  seasonal: boolean;
  active: boolean;
}

export interface Recommendation {
  id: string;
  user_id: string;
  item_id: string;
  week_of: string;
  tried: boolean;
  shelf_position: number | null;
  created_at: string;
  item?: CuratedItem;
}

export interface Bakery {
  name: string;
  address: string;
  rating?: number;
  distance?: string;
  url?: string;
  photoUrl?: string;
}

export type ClockState = "clocked_in" | "clocked_out";
