// lib/data.ts — Server-side data fetching for Nexus Arab

import { createClient } from './supabase/server';
import type { Project, Category, Service, Testimonial, Settings } from '@/types';

export async function getSettings(): Promise<Settings | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('settings')
    .select('*')
    .single();
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  return data ?? [];
}

export async function getProjects(categorySlug?: string): Promise<Project[]> {
  const supabase = createClient();
  let query = supabase
    .from('projects')
    .select('*, category:categories(*), pricing_plans(*)')
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (categorySlug && categorySlug !== 'all') {
    // join filter by category slug
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('projects')
    .select('*, category:categories(*)')
    .eq('is_featured', true)
    .order('sort_order')
    .limit(6);
  return data ?? [];
}

export async function getServices(): Promise<Service[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return data ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return data ?? [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('projects')
    .select('*, category:categories(*), pricing_plans(*)')
    .eq('id', id)
    .single();
  return data;
}
