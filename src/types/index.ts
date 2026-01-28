/**
 * Golf Tourism Platform - Type Definitions
 * 
 * Core types for the platform including user roles, vendors,
 * bookings, payments, and AI conversations.
 */

// ============================================================
// User & Authentication Types
// ============================================================

/**
 * User roles in the platform
 */
export type UserRole = 'admin' | 'golf_vendor' | 'hotel_vendor' | 'travel_vendor' | 'user';

/**
 * User profile from Supabase
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

/**
 * User preferences for AI recommendations
 */
export interface UserPreferences {
  preferred_price_range?: {
    min: number;
    max: number;
  };
  preferred_locations?: string[];
  preferred_amenities?: string[];
  golf_skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  dietary_requirements?: string[];
  accessibility_needs?: string[];
  booking_history_summary?: object;
}

// ============================================================
// Vendor Types
// ============================================================

/**
 * Golf course entity
 */
export interface GolfCourse {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  price_range: {
    min: number;
    max: number;
    currency: string;
  } | null;
  rating: number | null;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
}

/**
 * Tee time slot
 */
export interface TeeTime {
  id: string;
  course_id: string;
  date: string;
  time: string;
  available_slots: number;
  price: number;
  is_available: boolean;
  created_at: string;
}

/**
 * Caddie information
 */
export interface Caddie {
  id: string;
  course_id: string;
  name: string;
  experience_years: number | null;
  rating: number | null;
  hourly_rate: number | null;
  is_available: boolean;
  created_at: string;
}

/**
 * Hotel entity
 */
export interface Hotel {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  star_rating: number | null;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
}

/**
 * Hotel room type
 */
export interface HotelRoom {
  id: string;
  hotel_id: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  available_count: number;
  created_at: string;
}

/**
 * Travel package
 */
export interface TravelPackage {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  package_type: 'airport_transfer' | 'day_tour' | 'multi_day' | 'custom';
  price: number;
  duration_hours: number | null;
  includes: string[];
  is_active: boolean;
  created_at: string;
}

// ============================================================
// Booking Types
// ============================================================

/**
 * Booking status progression
 */
export type BookingStatus = 
  | 'pending_approval'
  | 'approved'
  | 'pending_payment'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

/**
 * Booking type category
 */
export type BookingType = 'golf' | 'hotel' | 'travel' | 'package';

/**
 * Booking entity
 */
export interface Booking {
  id: string;
  user_id: string;
  booking_type: BookingType;
  status: BookingStatus;
  total_amount: number;
  booking_details: BookingDetails;
  vendor_approvals: VendorApprovals;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Detailed booking items
 */
export interface BookingDetails {
  golf?: {
    course_id: string;
    tee_time_id: string;
    caddie_id?: string;
    players: number;
    date: string;
    time: string;
  };
  hotel?: {
    hotel_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    guests: number;
  };
  travel?: {
    package_id: string;
    departure_date: string;
    passengers: number;
    pickup_location?: string;
  };
}

/**
 * Vendor approval tracking
 */
export interface VendorApprovals {
  [vendorId: string]: {
    status: 'pending' | 'approved' | 'rejected';
    approved_at?: string;
    notes?: string;
  };
}

// ============================================================
// Payment Types
// ============================================================

/**
 * Payment status from Xendit
 */
export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'expired'
  | 'failed';

/**
 * Payment entity
 */
export interface Payment {
  id: string;
  booking_id: string;
  xendit_invoice_id: string | null;
  xendit_external_id: string | null;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  payment_channel: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Split settlement record for Admin
 */
export interface SplitSettlement {
  id: string;
  payment_id: string;
  vendor_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  settled_at: string | null;
  notes: string | null;
  created_at: string;
}

// ============================================================
// Score Tracking Types
// ============================================================

/**
 * Golf score entry sync status
 */
export type ScoreSyncStatus = 'local' | 'syncing' | 'synced';

/**
 * Individual hole score
 */
export interface HoleScore {
  strokes: number;
  par: number;
  notes?: string;
}

/**
 * Golf score card
 */
export interface GolfScore {
  id: string;
  user_id: string;
  course_id: string;
  booking_id: string | null;
  date: string;
  scores: { [holeNumber: number]: HoleScore };
  total_strokes: number | null;
  sync_status: ScoreSyncStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================
// AI Conversation Types
// ============================================================

/**
 * Chat message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    recommendations?: Recommendation[];
    booking_state?: Partial<BookingDetails>;
  };
}

/**
 * AI recommendation item
 */
export interface Recommendation {
  type: 'golf' | 'hotel' | 'travel';
  item_id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  distance_km?: number;
  image_url?: string;
  category: 'price' | 'rating' | 'proximity';
}

/**
 * Conversation entity
 */
export interface Conversation {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  context: ConversationContext;
  created_at: string;
  updated_at: string;
}

/**
 * Conversation context for AI memory
 */
export interface ConversationContext {
  current_booking?: Partial<BookingDetails>;
  preferences_extracted?: Partial<UserPreferences>;
  last_recommendations?: Recommendation[];
  booking_stage?: 'browsing' | 'selecting' | 'confirming' | 'paying';
}

// ============================================================
// Notification Types
// ============================================================

/**
 * Notification type
 */
export type NotificationType = 
  | 'booking_request'
  | 'approval_needed'
  | 'payment_received'
  | 'settlement'
  | 'system';

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  data: object | null;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
