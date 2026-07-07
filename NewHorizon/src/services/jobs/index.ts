import { supabase } from "../../../lib/supabase";

export interface Job {
  id: string;
  title: string;
  employer: string;
  location: string;
  description?: string;
  is_approved: boolean;
  created_at: string;
}

export async function getApprovedJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, employer, location, description, is_approved, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Job[];
}

export async function searchJobs(query: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, employer, location, description, is_approved, created_at")
    .eq("is_approved", true)
    .or(`title.ilike.%${query}%,employer.ilike.%${query}%,location.ilike.%${query}%`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Job[];
}
