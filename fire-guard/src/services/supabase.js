import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vdicsuucvvjzcnrbmwdh.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_VfRjC2T3xUKSzd1D58s5DQ_-LjPudt1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);