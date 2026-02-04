import { supabase } from "@/lib/supabase/client";

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
    return !error;
  } catch {
    return false;
  }
}
