import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://iwzeaqqojzppiyaplqek.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3emVhcXFvanpwcGl5YXBscWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzUxNTcsImV4cCI6MjA3OTgxMTE1N30.Gkm0V_tW7LFycGNDKnzVgPK3mIEp81VW176nvyS8V30";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if user profile exists
export const getCurrentUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
};
