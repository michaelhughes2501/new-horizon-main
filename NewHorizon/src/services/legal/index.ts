export interface LegalResource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: "civil" | "rights_restoration" | "expungement" | "immigration" | "general";
}

export function getLegalResources(): LegalResource[] {
  return [
    {
      id: "legal-1",
      name: "Legal Services Corporation",
      description: "Free civil legal aid for low-income Americans.",
      url: "https://www.lsc.gov/about-lsc/find-legal-aid",
      category: "civil",
    },
    {
      id: "legal-2",
      name: "Restoration of Rights Project",
      description:
        "State-by-state guide to restoring rights after conviction.",
      url: "https://ccresourcecenter.org/state-restoration-profiles",
      category: "rights_restoration",
    },
    {
      id: "legal-3",
      name: "Expungement Help",
      description:
        "Resources and guides for clearing your criminal record.",
      url: "https://www.courthelp.org",
      category: "expungement",
    },
  ];
}

export function getLegalResourcesByCategory(
  category: LegalResource["category"]
): LegalResource[] {
  return getLegalResources().filter((r) => r.category === category);
}
