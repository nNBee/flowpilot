import { createClient } from '@supabase/supabase-js';
import { config } from '../../config';

const supabaseUrl = config.supabaseUrl;
const supabasePublishableKey = config.supabasePublishableKey;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
