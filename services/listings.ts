import { createClient } from '@/lib/supabase/client';
import type { Listing } from '@/types';

export async function getListings(): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('LISTING')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('LISTING').delete().eq('id', id);
  if (error) throw error;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('LISTING')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data;
}

export async function createListing(data: Omit<Listing, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { error } = await supabase.from('LISTING').insert([data]);
  if (error) throw error;
}

export async function updateListing(id: string, data: Partial<Listing>) {
  const supabase = createClient();
  const { error } = await supabase.from('LISTING').update(data).eq('id', id);
  if (error) throw error;
}