-- ============================================================
-- Golf Tourism Platform - Initial Database Schema
-- Version: 001
-- Description: Core tables for users, vendors, bookings, and AI
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'golf_vendor', 'hotel_vendor', 'travel_vendor', 'user')) DEFAULT 'user',
  phone TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- GOLF COURSES TABLE
-- ============================================================

CREATE TABLE public.golf_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_range JSONB,
  rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.golf_courses ENABLE ROW LEVEL SECURITY;

-- Golf courses policies
CREATE POLICY "Anyone can view active golf courses"
  ON public.golf_courses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Golf vendors can manage their courses"
  ON public.golf_courses FOR ALL
  USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all golf courses"
  ON public.golf_courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- TEE TIMES TABLE
-- ============================================================

CREATE TABLE public.tee_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.golf_courses(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  available_slots INTEGER DEFAULT 4,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tee_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available tee times"
  ON public.tee_times FOR SELECT
  USING (is_available = true);

CREATE POLICY "Golf vendors can manage their tee times"
  ON public.tee_times FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.golf_courses
      WHERE id = course_id AND vendor_id = auth.uid()
    )
  );

-- ============================================================
-- CADDIES TABLE
-- ============================================================

CREATE TABLE public.caddies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.golf_courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  experience_years INTEGER,
  rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
  hourly_rate DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.caddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available caddies"
  ON public.caddies FOR SELECT
  USING (is_available = true);

CREATE POLICY "Golf vendors can manage their caddies"
  ON public.caddies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.golf_courses
      WHERE id = course_id AND vendor_id = auth.uid()
    )
  );

-- ============================================================
-- HOTELS TABLE
-- ============================================================

CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hotels"
  ON public.hotels FOR SELECT
  USING (is_active = true);

CREATE POLICY "Hotel vendors can manage their hotels"
  ON public.hotels FOR ALL
  USING (vendor_id = auth.uid());

-- ============================================================
-- HOTEL ROOMS TABLE
-- ============================================================

CREATE TABLE public.hotel_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  room_type TEXT NOT NULL,
  description TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  capacity INTEGER DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  available_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available hotel rooms"
  ON public.hotel_rooms FOR SELECT
  USING (available_count > 0);

CREATE POLICY "Hotel vendors can manage their rooms"
  ON public.hotel_rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.hotels
      WHERE id = hotel_id AND vendor_id = auth.uid()
    )
  );

-- ============================================================
-- TRAVEL PACKAGES TABLE
-- ============================================================

CREATE TABLE public.travel_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  package_type TEXT CHECK (package_type IN ('airport_transfer', 'day_tour', 'multi_day', 'custom')),
  price DECIMAL(10, 2) NOT NULL,
  duration_hours INTEGER,
  includes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active travel packages"
  ON public.travel_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Travel vendors can manage their packages"
  ON public.travel_packages FOR ALL
  USING (vendor_id = auth.uid());

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booking_type TEXT CHECK (booking_type IN ('golf', 'hotel', 'travel', 'package')) NOT NULL,
  status TEXT CHECK (status IN ('pending_approval', 'approved', 'pending_payment', 'paid', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending_approval',
  total_amount DECIMAL(10, 2) NOT NULL,
  booking_details JSONB NOT NULL,
  vendor_approvals JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors can view bookings for their items"
  ON public.bookings FOR SELECT
  USING (
    vendor_approvals ? auth.uid()::text
  );

CREATE POLICY "Vendors can update bookings for approval"
  ON public.bookings FOR UPDATE
  USING (
    vendor_approvals ? auth.uid()::text
  );

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  xendit_invoice_id TEXT,
  xendit_external_id TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'expired', 'failed')) DEFAULT 'pending',
  payment_method TEXT,
  payment_channel TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- SPLIT SETTLEMENTS TABLE
-- ============================================================

CREATE TABLE public.split_settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.split_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own settlements"
  ON public.split_settlements FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all settlements"
  ON public.split_settlements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- GOLF SCORES TABLE (for PWA offline sync)
-- ============================================================

CREATE TABLE public.golf_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.golf_courses(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  date DATE NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  total_strokes INTEGER,
  sync_status TEXT CHECK (sync_status IN ('local', 'syncing', 'synced')) DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scores"
  ON public.golf_scores FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Golf vendors can view scores at their courses"
  ON public.golf_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.golf_courses
      WHERE id = course_id AND vendor_id = auth.uid()
    )
  );

-- ============================================================
-- CONVERSATIONS TABLE (AI memory)
-- ============================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations"
  ON public.conversations FOR ALL
  USING (user_id = auth.uid());

-- ============================================================
-- USER PREFERENCES TABLE
-- ============================================================

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  preferred_price_range JSONB,
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_amenities TEXT[] DEFAULT '{}',
  golf_skill_level TEXT,
  dietary_requirements TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  booking_history_summary JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (user_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('booking_request', 'approval_needed', 'payment_received', 'settlement', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (recipient_id = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_golf_courses_vendor ON public.golf_courses(vendor_id);
CREATE INDEX idx_golf_courses_active ON public.golf_courses(is_active);
CREATE INDEX idx_tee_times_course ON public.tee_times(course_id);
CREATE INDEX idx_tee_times_date ON public.tee_times(date);
CREATE INDEX idx_hotels_vendor ON public.hotels(vendor_id);
CREATE INDEX idx_hotel_rooms_hotel ON public.hotel_rooms(hotel_id);
CREATE INDEX idx_travel_packages_vendor ON public.travel_packages(vendor_id);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_golf_scores_user ON public.golf_scores(user_id);
CREATE INDEX idx_golf_scores_course ON public.golf_scores(course_id);
CREATE INDEX idx_conversations_user ON public.conversations(user_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id) WHERE is_read = false;

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_golf_scores_updated_at
  BEFORE UPDATE ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.golf_scores;
