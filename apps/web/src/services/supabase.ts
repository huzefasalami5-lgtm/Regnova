import { createClient } from '@supabase/supabase-js';

// Supabase Cloud Project Configuration (Project: Regnova, ID: vaslxudowopjhvtzwfeo)
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://vaslxudowopjhvtzwfeo.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhc2x4dWRvd29wamh2dHp3ZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTMyNjUsImV4cCI6MjEwNjE4OTI2NX0.AEgRnFO5Fs2jD_d7x299yi5n8x3TnQhh_8rZ63Zv_U4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
