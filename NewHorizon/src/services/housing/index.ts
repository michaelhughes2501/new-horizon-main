import { supabase } from "../../../lib/supabase";

export interface HousingResource {
  id: string;
  name: string;
  description: string;
  url?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  is_approved: boolean;
  created_at: string;
}

/** Fetch database-backed housing resources (when the table exists). */
export async function getHousingResources(): Promise<HousingResource[]> {
  const { data, error } = await supabase
    .from("housing_resources")
    .select("*")
    .eq("is_approved", true)
    .order("name");

  // Table may not exist yet — fall back to static list
  if (error) return getStaticHousingResources();
  return (data ?? []) as HousingResource[];
}

/** Curated static fallback — always available offline. */
export function getStaticHousingResources(): HousingResource[] {
  return [
    {
      id: "static-1",
      name: "Reentry Housing Network",
      description: "Find transitional housing and reentry-friendly landlords.",
      url: "https://www.reentrycouncil.org/housing",
      is_approved: true,
      created_at: "",
    },
    {
      id: "static-2",
      name: "HUD Reentry Resources",
      description:
        "Federal housing assistance programs for people leaving incarceration.",
      url: "https://www.hud.gov/program_offices/public_indian_housing/programs/ph/reentry",
      is_approved: true,
      created_at: "",
    },
  ];
}
