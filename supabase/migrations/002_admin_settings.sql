-- ============================================================
-- ADMIN SETTINGS & CAMPAIGNS
-- Description: Stores global app configuration and promotional content
-- ============================================================

-- 1. System Settings (Key-Value store for global config)
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only Admins can modify settings, Everyone can read (for rendering)
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Everyone can read system settings"
  ON public.system_settings FOR SELECT
  USING (true);

-- 2. Promotional Banners (For User Dashboard)
CREATE TABLE public.promotional_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage banners"
  ON public.promotional_banners FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Everyone can read active banners"
  ON public.promotional_banners FOR SELECT
  USING (is_active = true);

-- Seed Initial Data
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('user_dashboard_theme', '{"background_url": "", "use_image": false, "primary_color": "emerald"}', 'Configuration for the User Dashboard header appearance');

-- Seed a sample banner
INSERT INTO public.promotional_banners (title, image_url, sort_order)
VALUES 
  ('Summer Golf Special', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop', 1);
