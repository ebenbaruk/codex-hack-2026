import type {
  EvidenceSignal,
  Sector,
  SyntheticBusiness,
} from "./types";

const cities = [
  { city: "Lyon", department: "Rhône", latitude: 45.764, longitude: 4.8357 },
  { city: "Villeurbanne", department: "Rhône", latitude: 45.7719, longitude: 4.8902 },
  { city: "Saint-Étienne", department: "Loire", latitude: 45.4397, longitude: 4.3872 },
  { city: "Grenoble", department: "Isère", latitude: 45.1885, longitude: 5.7245 },
  { city: "Valence", department: "Drôme", latitude: 44.9334, longitude: 4.8924 },
  { city: "Chambéry", department: "Savoie", latitude: 45.5646, longitude: 5.9178 },
  { city: "Annecy", department: "Haute-Savoie", latitude: 45.8992, longitude: 6.1294 },
  { city: "Bourg-en-Bresse", department: "Ain", latitude: 46.2052, longitude: 5.2255 },
  { city: "Roanne", department: "Loire", latitude: 46.0362, longitude: 4.068 },
  { city: "Vienne", department: "Isère", latitude: 45.5256, longitude: 4.8743 },
] as const;

const sectorConfig: Record<
  Sector,
  {
    label: string;
    names: string[];
    revenueBase: number;
    marginBase: number;
    recurringBase: number;
  }
> = {
  hvac: {
    label: "HVAC",
    names: ["ThermaNova", "ClimaForge", "Air & Calorie", "Confort Axis", "Alpine Thermique"],
    revenueBase: 1_080_000,
    marginBase: 0.17,
    recurringBase: 0.61,
  },
  plumbing: {
    label: "Plomberie",
    names: ["Hydrovia", "Atelier Siphon", "Flux & Fils", "Plombierium", "Source Technique"],
    revenueBase: 890_000,
    marginBase: 0.15,
    recurringBase: 0.42,
  },
  commercial_cleaning: {
    label: "Propreté",
    names: ["Nettoria", "Éclat Pro", "Prisme Services", "Horizon Hygiène", "Carré Net"],
    revenueBase: 1_350_000,
    marginBase: 0.13,
    recurringBase: 0.79,
  },
  industrial_maintenance: {
    label: "Maintenance",
    names: ["Mécaflux", "Atelier Vector", "IndusCare", "Rhône Mécanique", "Continuum Services"],
    revenueBase: 1_720_000,
    marginBase: 0.18,
    recurringBase: 0.66,
  },
};

const suffixes = ["Groupe", "Services", "Technique", "Solutions"];
const observedDates = ["2026-05-12", "2026-04-03", "2026-03-18", "2026-02-09"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function signal(
  businessId: string,
  index: number,
  partial: Omit<EvidenceSignal, "id" | "observed_at">,
): EvidenceSignal {
  return {
    id: `${businessId}-ev-${index}`,
    observed_at: observedDates[index % observedDates.length],
    ...partial,
  };
}

function makeEvidence(
  id: string,
  foundedYear: number,
  recurring: number,
  ownerProminence: number,
  managementVisibility: number,
  websiteAge: number,
  hiringSignal: boolean,
): EvidenceSignal[] {
  const evidence: EvidenceSignal[] = [
    signal(id, 0, {
      type: "registry",
      label: "Long operating history",
      detail: `Synthetic registry history shows continuous activity since ${foundedYear}.`,
      strength: foundedYear < 2005 ? "strong" : "medium",
      source: "Synthetic registry snapshot",
    }),
    signal(id, 1, {
      type: "commercial",
      label: "Recurring service base",
      detail: `${Math.round(recurring * 100)}% estimated recurring maintenance or service revenue.`,
      strength: recurring > 0.62 ? "strong" : recurring > 0.48 ? "medium" : "weak",
      source: "Synthetic commercial profile",
    }),
    signal(id, 2, {
      type: "website",
      label: "Owner-led contact path",
      detail:
        ownerProminence > 0.7
          ? "The principal contact path routes directly to the dirigeant role."
          : "A general business contact route is visible without a named management layer.",
      strength: ownerProminence > 0.7 ? "strong" : "medium",
      source: "Synthetic website observation",
    }),
    signal(id, 3, {
      type: "operations",
      label: "Management bench visibility",
      detail:
        managementVisibility < 0.4
          ? "No second management layer is visible in the synthetic profile."
          : "At least one operational manager is visible in the synthetic profile.",
      strength: managementVisibility < 0.4 ? "strong" : "weak",
      source: "Synthetic organization profile",
    }),
    signal(id, 4, {
      type: "website",
      label: "Digital investment signal",
      detail: `Synthetic website appears approximately ${websiteAge} years since its last major refresh.`,
      strength: websiteAge >= 4 ? "medium" : "weak",
      source: "Synthetic web snapshot",
    }),
  ];

  if (hiringSignal) {
    evidence.push(
      signal(id, 5, {
        type: "hiring",
        label: "Active technician hiring",
        detail: "A recent synthetic hiring signal suggests demand and capacity pressure.",
        strength: "medium",
        source: "Synthetic job-board snapshot",
      }),
    );
  }

  return evidence;
}

export function createSyntheticBusinesses(): SyntheticBusiness[] {
  const sectorList = Object.keys(sectorConfig) as Sector[];
  return Array.from({ length: 40 }, (_, index) => {
    const sector = sectorList[index % sectorList.length];
    const config = sectorConfig[sector];
    const location = cities[(index * 3 + Math.floor(index / 4)) % cities.length];
    const cycle = Math.floor(index / sectorList.length);
    const id = `syn-${sector.replaceAll("_", "-")}-${String(cycle + 1).padStart(2, "0")}`;
    const revenueMultiplier = 0.72 + ((index * 17) % 61) / 100;
    const revenue = Math.round((config.revenueBase * revenueMultiplier) / 10_000) * 10_000;
    const margin = clamp(config.marginBase + (((index * 7) % 9) - 4) / 100, 0.09, 0.24);
    const recurring = clamp(config.recurringBase + (((index * 11) % 17) - 8) / 100, 0.28, 0.88);
    const foundedYear = 1988 + ((index * 7) % 29);
    const ownerProminence = clamp(0.44 + ((index * 13) % 48) / 100, 0.4, 0.94);
    const managementVisibility = clamp(0.22 + ((index * 9) % 55) / 100, 0.2, 0.82);
    const websiteAge = 1 + ((index * 5) % 6);
    const hiringSignal = index % 3 === 0 || index % 7 === 0;
    const baseName = config.names[cycle % config.names.length];
    const suffix = suffixes[(cycle + index) % suffixes.length];

    return {
      id,
      name: `${baseName} ${suffix} — Démo`,
      sector,
      city: location.city,
      department: location.department,
      latitude: location.latitude + (((index % 3) - 1) * 0.025),
      longitude: location.longitude + ((((index + 1) % 3) - 1) * 0.03),
      founded_year: foundedYear,
      employee_estimate: 6 + ((index * 5) % 31),
      revenue_estimate_eur: revenue,
      ebitda_margin: Number(margin.toFixed(2)),
      recurring_revenue_ratio: Number(recurring.toFixed(2)),
      review_rating: Number((4.1 + ((index * 3) % 8) / 10).toFixed(1)),
      review_count: 22 + ((index * 19) % 181),
      website_freshness_years: websiteAge,
      management_visibility: Number(managementVisibility.toFixed(2)),
      owner_contact_prominence: Number(ownerProminence.toFixed(2)),
      hiring_signal: hiringSignal,
      contactability: Number(clamp(0.55 + ((index * 7) % 42) / 100, 0.55, 0.96).toFixed(2)),
      evidence: makeEvidence(
        id,
        foundedYear,
        recurring,
        ownerProminence,
        managementVisibility,
        websiteAge,
        hiringSignal,
      ),
    };
  });
}

export const syntheticBusinesses = createSyntheticBusinesses();

export const sectorLabels: Record<Sector, string> = {
  hvac: "HVAC",
  plumbing: "Plomberie",
  commercial_cleaning: "Propreté B2B",
  industrial_maintenance: "Maintenance industrielle",
};

