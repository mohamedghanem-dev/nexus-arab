// types/index.ts — Nexus Arab Type Definitions

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  live_demo_url: string | null;
  github_url: string | null;
  video_url: string | null;
  type: 'project' | 'system';
  features: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  category?: Category;
  pricing_plans?: PricingPlan[];
}

export interface PricingPlan {
  id: string;
  project_id: string;
  plan_name: 'monthly' | 'lifetime' | 'source_code';
  price: number;
  currency: string;
  features: string[] | null;
  is_popular: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  show_whatsapp_button: boolean;
  whatsapp_message: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar_url: string | null;
  content: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Settings {
  id: string;
  agency_name: string;
  tagline: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  x_url: string | null;
  telegram_url: string | null;
  ai_assistant_enabled: boolean;
  ai_assistant_name: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

// UI Types
export type Theme = 'dark' | 'light';

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'x' | 'telegram';
  url: string;
  icon: string;
}

export interface FilterTab {
  label: string;
  value: string;
}
