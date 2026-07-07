/**
 * Aggregated resources service — single import for all reentry resource
 * categories. Screens should import from here, not the individual services.
 */
export {
  getHousingResources,
  getStaticHousingResources,
  type HousingResource,
} from "../housing";

export { getLegalResources, getLegalResourcesByCategory, type LegalResource } from "../legal";

export { getApprovedJobs, searchJobs, type Job } from "../jobs";

export interface ResourceCategory {
  key: "housing" | "jobs" | "legal" | "mental_health";
  title: string;
  emoji: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { key: "housing", title: "Housing", emoji: "🏠" },
  { key: "jobs", title: "Jobs & Employment", emoji: "💼" },
  { key: "legal", title: "Legal Aid", emoji: "⚖️" },
  { key: "mental_health", title: "Mental Health", emoji: "🧠" },
];

export const MENTAL_HEALTH_RESOURCES = [
  {
    id: "mh-1",
    name: "SAMHSA Helpline",
    description: "24/7 free, confidential treatment referral service.",
    url: "https://www.samhsa.gov/find-help/national-helpline",
  },
  {
    id: "mh-2",
    name: "Crisis Text Line",
    description: "Text HOME to 741741 for free 24/7 crisis support.",
    url: "https://www.crisistextline.org",
  },
];
