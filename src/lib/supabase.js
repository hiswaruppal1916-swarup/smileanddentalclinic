import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hijuwwovpsrrvugppjxn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpanV3d292cHNycnZ1Z3BwanhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNTEzMzUsImV4cCI6MjEwNjkyNzMzNX0.Tr09cwnLNVypvOh-NEvP8kzbMsZqjDtKCBy6yIaWilE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
