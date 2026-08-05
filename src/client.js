import { createClient } from "@supabase/supabase-js";

const URL =" https://wxzjwisbitvyqsvhefzo.supabase.co";
const API_KEY = "sb_publishable_78iJWl_L3JhBkvrscfhvqQ_S0NSG3rv";

export const supabase = createClient(URL, API_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});