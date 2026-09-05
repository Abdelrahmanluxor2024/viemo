import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhqqtyqsblpmyskrvekp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocXF0eXFzYmxwbXlza3J2ZWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTYyMzIsImV4cCI6MjEwMzY5MjIzMn0.gxMnRIx9a7I9mAoZYIrcB42uNlZijI_M7xss7BNte6s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
