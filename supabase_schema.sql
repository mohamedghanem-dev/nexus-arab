-- ============================================================
-- NEXUS ARAB — Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. CATEGORIES (أقسام المشاريع)
-- ─────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, sort_order) VALUES
  ('الكل',              'all',      0),
  ('مواقع ويب',         'websites', 1),
  ('تطبيقات موبايل',   'apps',     2),
  ('أنظمة إدارية',     'systems',  3),
  ('أدوات ذكاء اصطناعي','ai-tools', 4),
  ('لوحات تحكم',       'dashboards',5);

-- ─────────────────────────────────────────────
-- 2. PROJECTS (المشاريع / البورتفوليو)
-- ─────────────────────────────────────────────
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url     TEXT,
  live_demo_url TEXT,
  github_url    TEXT,
  video_url     TEXT,
  type          TEXT CHECK (type IN ('project','system')) DEFAULT 'project',
  features      TEXT[],
  tags          TEXT[],
  is_featured   BOOLEAN DEFAULT FALSE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. PRICING PLANS (باقات الأسعار — للأنظمة)
-- ─────────────────────────────────────────────
CREATE TABLE pricing_plans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  plan_name   TEXT CHECK (plan_name IN ('monthly','lifetime','source_code')) NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  currency    TEXT DEFAULT 'USD',
  features    TEXT[],
  is_popular  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. SERVICES (الخدمات)
-- ─────────────────────────────────────────────
CREATE TABLE services (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                TEXT NOT NULL,
  description          TEXT,
  price                TEXT,
  image_url            TEXT,
  show_whatsapp_button BOOLEAN DEFAULT TRUE,
  whatsapp_message     TEXT,
  sort_order           INT DEFAULT 0,
  is_active            BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5. TESTIMONIALS (آراء العملاء)
-- ─────────────────────────────────────────────
CREATE TABLE testimonials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  role        TEXT,
  company     TEXT,
  avatar_url  TEXT,
  content     TEXT NOT NULL,
  rating      INT CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 6. SETTINGS (إعدادات الشركة)
-- ─────────────────────────────────────────────
-- ملاحظة أمان مهمة: هذا الجدول قابل للقراءة من أي زائر (RLS SELECT = true)
-- لأن بياناته (اسم الشركة، واتساب، السوشيال ميديا) معروضة في الموقع العام.
-- لهذا السبب لا نضع هنا أي مفاتيح API حقيقية (Groq/Gemini) — لو خزّنتها هنا
-- هيقدر أي حد يجيبها بنفس anon key الموجود في كود الموقع نفسه.
-- المفاتيح الحقيقية تتخزن فقط في Environment Variables على Vercel،
-- وهذا الجدول يحتفظ فقط بـ "تفعيل/تعطيل" المساعد واسمه — بيانات غير حساسة.
CREATE TABLE settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_name      TEXT DEFAULT 'Nexus Arab',
  tagline          TEXT DEFAULT 'نُشيد الأعمال الرقمية للمستقبل',
  email            TEXT,
  phone            TEXT,
  whatsapp_number  TEXT,
  -- Social Links
  instagram_url    TEXT,
  facebook_url     TEXT,
  linkedin_url     TEXT,
  youtube_url      TEXT,
  x_url            TEXT,
  telegram_url     TEXT,
  -- AI Config (بدون مفاتيح — المفاتيح في Vercel env فقط)
  ai_assistant_enabled BOOLEAN DEFAULT FALSE,
  ai_assistant_name    TEXT DEFAULT 'Nexus AI',
  -- Meta
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row (singleton)
INSERT INTO settings (agency_name) VALUES ('Nexus Arab');

-- ─────────────────────────────────────────────
-- 7. CONTACT MESSAGES (رسائل التواصل)
-- ─────────────────────────────────────────────
CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. ADMIN USERS (جدول الأدمن — مع Supabase Auth)
-- ─────────────────────────────────────────────
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

-- Public can READ projects, categories, services, testimonials, settings
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials   ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users    ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public read projects"      ON projects       FOR SELECT USING (true);
CREATE POLICY "public read categories"    ON categories     FOR SELECT USING (true);
CREATE POLICY "public read services"      ON services       FOR SELECT USING (is_active = true);
CREATE POLICY "public read testimonials"  ON testimonials   FOR SELECT USING (is_active = true);
CREATE POLICY "public read settings"      ON settings       FOR SELECT USING (true);
CREATE POLICY "public read pricing"       ON pricing_plans  FOR SELECT USING (true);

-- Public can INSERT contact messages
CREATE POLICY "public insert contact"     ON contact_messages FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated users in admin_users table)
CREATE POLICY "admin all projects"     ON projects       FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin all categories"   ON categories     FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin all services"     ON services       FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin all testimonials" ON testimonials   FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin all settings"     ON settings       FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin all pricing"      ON pricing_plans  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin read contact"     ON contact_messages FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin update contact"   ON contact_messages FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin delete contact"   ON contact_messages FOR DELETE USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "admin all admin_users"  ON admin_users    FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────
-- Run these in Supabase Dashboard > Storage > New Bucket
-- OR via SQL:

INSERT INTO storage.buckets (id, name, public) VALUES
  ('projects',     'projects',     true),
  ('services',     'services',     true),
  ('avatars',      'avatars',      true);

-- Allow public read on all buckets
CREATE POLICY "public read projects bucket"  ON storage.objects FOR SELECT USING (bucket_id = 'projects');
CREATE POLICY "public read services bucket"  ON storage.objects FOR SELECT USING (bucket_id = 'services');
CREATE POLICY "public read avatars bucket"   ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow admin upload
CREATE POLICY "admin upload projects" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'projects' AND auth.uid() IN (SELECT id FROM admin_users)
);
CREATE POLICY "admin upload services" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'services' AND auth.uid() IN (SELECT id FROM admin_users)
);
CREATE POLICY "admin upload avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid() IN (SELECT id FROM admin_users)
);
CREATE POLICY "admin delete projects" ON storage.objects FOR DELETE USING (
  bucket_id IN ('projects','services','avatars') AND auth.uid() IN (SELECT id FROM admin_users)
);
CREATE POLICY "admin update objects" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('projects','services','avatars') AND auth.uid() IN (SELECT id FROM admin_users)
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
