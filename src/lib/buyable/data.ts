import type {
  BusinessRegion,
  ContactPath,
  EvidenceSignal,
  FinancialYear,
  Sector,
  SyntheticBusiness,
  TransitionSignal,
} from "./types";

type Location = {
  region: BusinessRegion;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
};

const locations: Location[] = [
  { region: "Auvergne-Rhône-Alpes", city: "Lyon", department: "Rhône", latitude: 45.764, longitude: 4.836 },
  { region: "Auvergne-Rhône-Alpes", city: "Grenoble", department: "Isère", latitude: 45.189, longitude: 5.725 },
  { region: "Auvergne-Rhône-Alpes", city: "Saint-Étienne", department: "Loire", latitude: 45.44, longitude: 4.387 },
  { region: "Bourgogne-Franche-Comté", city: "Dijon", department: "Côte-d’Or", latitude: 47.323, longitude: 5.041 },
  { region: "Bourgogne-Franche-Comté", city: "Besançon", department: "Doubs", latitude: 47.238, longitude: 6.024 },
  { region: "Bourgogne-Franche-Comté", city: "Chalon-sur-Saône", department: "Saône-et-Loire", latitude: 46.781, longitude: 4.853 },
  { region: "Bretagne", city: "Rennes", department: "Ille-et-Vilaine", latitude: 48.117, longitude: -1.677 },
  { region: "Bretagne", city: "Brest", department: "Finistère", latitude: 48.39, longitude: -4.486 },
  { region: "Bretagne", city: "Lorient", department: "Morbihan", latitude: 47.748, longitude: -3.37 },
  { region: "Centre-Val de Loire", city: "Tours", department: "Indre-et-Loire", latitude: 47.394, longitude: 0.684 },
  { region: "Centre-Val de Loire", city: "Orléans", department: "Loiret", latitude: 47.903, longitude: 1.909 },
  { region: "Centre-Val de Loire", city: "Bourges", department: "Cher", latitude: 47.081, longitude: 2.399 },
  { region: "Corse", city: "Ajaccio", department: "Corse-du-Sud", latitude: 41.919, longitude: 8.738 },
  { region: "Corse", city: "Bastia", department: "Haute-Corse", latitude: 42.697, longitude: 9.45 },
  { region: "Corse", city: "Porto-Vecchio", department: "Corse-du-Sud", latitude: 41.591, longitude: 9.279 },
  { region: "Grand Est", city: "Strasbourg", department: "Bas-Rhin", latitude: 48.573, longitude: 7.752 },
  { region: "Grand Est", city: "Reims", department: "Marne", latitude: 49.258, longitude: 4.032 },
  { region: "Grand Est", city: "Metz", department: "Moselle", latitude: 49.119, longitude: 6.176 },
  { region: "Hauts-de-France", city: "Lille", department: "Nord", latitude: 50.629, longitude: 3.057 },
  { region: "Hauts-de-France", city: "Amiens", department: "Somme", latitude: 49.895, longitude: 2.302 },
  { region: "Hauts-de-France", city: "Arras", department: "Pas-de-Calais", latitude: 50.291, longitude: 2.777 },
  { region: "Île-de-France", city: "Paris", department: "Paris", latitude: 48.857, longitude: 2.352 },
  { region: "Île-de-France", city: "Nanterre", department: "Hauts-de-Seine", latitude: 48.893, longitude: 2.207 },
  { region: "Île-de-France", city: "Créteil", department: "Val-de-Marne", latitude: 48.79, longitude: 2.455 },
  { region: "Normandie", city: "Rouen", department: "Seine-Maritime", latitude: 49.443, longitude: 1.1 },
  { region: "Normandie", city: "Caen", department: "Calvados", latitude: 49.182, longitude: -0.37 },
  { region: "Normandie", city: "Le Havre", department: "Seine-Maritime", latitude: 49.494, longitude: 0.107 },
  { region: "Nouvelle-Aquitaine", city: "Bordeaux", department: "Gironde", latitude: 44.838, longitude: -0.579 },
  { region: "Nouvelle-Aquitaine", city: "Limoges", department: "Haute-Vienne", latitude: 45.833, longitude: 1.261 },
  { region: "Nouvelle-Aquitaine", city: "Bayonne", department: "Pyrénées-Atlantiques", latitude: 43.493, longitude: -1.475 },
  { region: "Occitanie", city: "Toulouse", department: "Haute-Garonne", latitude: 43.604, longitude: 1.444 },
  { region: "Occitanie", city: "Montpellier", department: "Hérault", latitude: 43.611, longitude: 3.877 },
  { region: "Occitanie", city: "Nîmes", department: "Gard", latitude: 43.837, longitude: 4.36 },
  { region: "Pays de la Loire", city: "Nantes", department: "Loire-Atlantique", latitude: 47.218, longitude: -1.553 },
  { region: "Pays de la Loire", city: "Angers", department: "Maine-et-Loire", latitude: 47.478, longitude: -0.563 },
  { region: "Pays de la Loire", city: "Le Mans", department: "Sarthe", latitude: 48.006, longitude: 0.199 },
  { region: "Provence-Alpes-Côte d’Azur", city: "Marseille", department: "Bouches-du-Rhône", latitude: 43.297, longitude: 5.37 },
  { region: "Provence-Alpes-Côte d’Azur", city: "Nice", department: "Alpes-Maritimes", latitude: 43.71, longitude: 7.262 },
  { region: "Provence-Alpes-Côte d’Azur", city: "Toulon", department: "Var", latitude: 43.125, longitude: 5.93 },
];

const sectorConfig: Record<
  Sector,
  {
    label: string;
    names: string[];
    revenueBase: number;
    marginBase: number;
    recurringBase: number;
    capexBase: number;
    multiple: number;
  }
> = {
  hvac: {
    label: "HVAC",
    names: ["ThermaNova", "ClimaForge", "Air & Calorie", "Confort Axis", "Alpine Thermique"],
    revenueBase: 1_650_000,
    marginBase: 0.17,
    recurringBase: 0.65,
    capexBase: 0.035,
    multiple: 4,
  },
  plumbing: {
    label: "Plomberie",
    names: ["Hydrovia", "Atelier Siphon", "Flux & Fils", "Plombierium", "Source Technique"],
    revenueBase: 1_350_000,
    marginBase: 0.15,
    recurringBase: 0.48,
    capexBase: 0.03,
    multiple: 3.6,
  },
  commercial_cleaning: {
    label: "Propreté B2B",
    names: ["Nettoria", "Éclat Pro", "Prisme Services", "Horizon Hygiène", "Carré Net"],
    revenueBase: 1_950_000,
    marginBase: 0.13,
    recurringBase: 0.82,
    capexBase: 0.022,
    multiple: 3.8,
  },
  industrial_maintenance: {
    label: "Maintenance industrielle",
    names: ["Mécaflux", "Atelier Vector", "IndusCare", "Rhône Mécanique", "Continuum Services"],
    revenueBase: 2_250_000,
    marginBase: 0.18,
    recurringBase: 0.68,
    capexBase: 0.045,
    multiple: 4.4,
  },
  electrical_contracting: {
    label: "Électricité technique",
    names: ["Voltance", "Circuit Pro", "Ampère Services", "Nexelec", "Phase Technique"],
    revenueBase: 1_700_000,
    marginBase: 0.15,
    recurringBase: 0.43,
    capexBase: 0.032,
    multiple: 3.7,
  },
  fire_safety: {
    label: "Sécurité incendie",
    names: ["Ignis Contrôle", "Parefeu Services", "Sécura Feu", "Flamme Zéro", "Vigie Incendie"],
    revenueBase: 1_850_000,
    marginBase: 0.2,
    recurringBase: 0.79,
    capexBase: 0.02,
    multiple: 4.6,
  },
  elevator_maintenance: {
    label: "Maintenance ascenseurs",
    names: ["Altivia", "Élévation Service", "Verticalis", "Niveau Plus", "Ascensia"],
    revenueBase: 2_100_000,
    marginBase: 0.19,
    recurringBase: 0.86,
    capexBase: 0.028,
    multiple: 4.8,
  },
  landscaping: {
    label: "Paysagisme B2B",
    names: ["Canopée Pro", "Vert Horizon", "Arboris", "Terrasse & Parc", "Sève Services"],
    revenueBase: 1_250_000,
    marginBase: 0.14,
    recurringBase: 0.55,
    capexBase: 0.06,
    multiple: 3.4,
  },
  waste_management: {
    label: "Gestion des déchets",
    names: ["Cycleo", "Triance", "Valoris Services", "ReSource Pro", "Boucle Environnement"],
    revenueBase: 2_350_000,
    marginBase: 0.18,
    recurringBase: 0.74,
    capexBase: 0.075,
    multiple: 4.2,
  },
  business_security: {
    label: "Sûreté des entreprises",
    names: ["Vigilis", "Sentinelle Pro", "SécuraTech", "Veille Active", "Bastion Services"],
    revenueBase: 1_750_000,
    marginBase: 0.16,
    recurringBase: 0.76,
    capexBase: 0.018,
    multiple: 4.1,
  },
};

const observedDates = [
  "2026-06-12",
  "2026-05-27",
  "2026-05-03",
  "2026-04-18",
  "2026-03-09",
  "2026-02-21",
] as const;

const SYNTHETIC_BUSINESS_COUNT = 2_500;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rounded(value: number, step = 1) {
  return Math.round(value / step) * step;
}

function evidenceSignal(
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

function makeFinancialHistory(
  revenue2025: number,
  margin2025: number,
  capexRatio: number,
  index: number,
): FinancialYear[] {
  const growth2025 = 0.018 + ((index * 7) % 75) / 1000;
  const growth2024 = 0.012 + ((index * 11) % 68) / 1000;
  const revenue2024 = rounded(revenue2025 / (1 + growth2025), 10_000);
  const revenue2023 = rounded(revenue2024 / (1 + growth2024), 10_000);

  return [
    { year: 2023 as const, revenue_eur: revenue2023, ebitda_margin: Number(clamp(margin2025 - 0.012, 0.07, 0.28).toFixed(3)) },
    { year: 2024 as const, revenue_eur: revenue2024, ebitda_margin: Number(clamp(margin2025 - 0.005, 0.07, 0.28).toFixed(3)) },
    { year: 2025 as const, revenue_eur: revenue2025, ebitda_margin: Number(margin2025.toFixed(3)) },
  ].map((year) => {
    const ebitda = rounded(year.revenue_eur * year.ebitda_margin, 1_000);
    return {
      ...year,
      ebitda_eur: ebitda,
      free_cash_flow_eur: rounded(
        ebitda * 0.72 - year.revenue_eur * capexRatio,
        1_000,
      ),
    };
  });
}

function makeTransitionSignals(
  id: string,
  leadershipTenure: number,
  successorVisible: boolean,
  leadershipChanges: number,
  publicMention: boolean,
): TransitionSignal[] {
  const signals: TransitionSignal[] = [];

  if (leadershipTenure >= 18) {
    signals.push({
      type: "long_leadership_tenure",
      label: "Long leadership continuity",
      detail: `Synthetic registry history shows ${leadershipTenure} years of continuous leadership.`,
      observed_at: observedDates[0],
      strength: leadershipTenure >= 25 ? "strong" : "medium",
      source: "Synthetic registry timeline",
    });
  }
  if (!successorVisible) {
    signals.push({
      type: "no_visible_successor",
      label: "No visible successor",
      detail: "No successor or second-generation leadership is visible in the synthetic public profile.",
      observed_at: observedDates[1],
      strength: "medium",
      source: "Synthetic leadership profile",
    });
  }
  if (leadershipChanges > 0) {
    signals.push({
      type: "leadership_change",
      label: "Recent leadership movement",
      detail: `${leadershipChanges} synthetic leadership change${leadershipChanges > 1 ? "s" : ""} recorded over three years.`,
      observed_at: observedDates[2],
      strength: leadershipChanges > 1 ? "strong" : "medium",
      source: "Synthetic registry event feed",
    });
  }
  if (publicMention) {
    signals.push({
      type: "public_transition_mention",
      label: "Public continuity language",
      detail: "A synthetic trade-publication interview mentions preparing the company’s long-term continuity.",
      observed_at: observedDates[3],
      strength: "strong",
      source: "Synthetic trade-publication snapshot",
    });
  }

  return signals;
}

function makeContacts(id: string, contactability: number): ContactPath[] {
  const contacts: ContactPath[] = [
    {
      channel: "contact_form",
      value: `https://${id}.example.invalid/contact`,
      role: "General company contact",
      confidence: Math.round(contactability * 100),
      note: "Synthetic, non-routable demo contact. Buyable never sends outreach.",
    },
  ];
  if (contactability >= 0.68) {
    contacts.unshift({
      channel: "business_email",
      value: `direction@${id}.example.invalid`,
      role: "Direction",
      confidence: Math.round(contactability * 96),
      note: "Synthetic .invalid address reserved for demonstration.",
    });
  }
  if (contactability >= 0.83) {
    contacts.push({
      channel: "business_phone",
      value: `SYNTHETIC-PHONE-${id.slice(-4).toUpperCase()}`,
      role: "Company switchboard",
      confidence: Math.round(contactability * 92),
      note: "Synthetic identifier; it is not a callable telephone number.",
    });
  }
  return contacts;
}

function makeEvidence(
  business: Omit<SyntheticBusiness, "evidence">,
): EvidenceSignal[] {
  const history = business.financial_history;
  const revenueGrowth =
    (history[2].revenue_eur - history[0].revenue_eur) / history[0].revenue_eur;

  return [
    evidenceSignal(business.id, 0, {
      type: "registry",
      label: "Established operating history",
      detail: `Continuous synthetic registry activity since ${business.founded_year}.`,
      strength: business.founded_year <= 2003 ? "strong" : "medium",
      source: "Synthetic registry snapshot",
      classification: "known",
    }),
    evidenceSignal(business.id, 1, {
      type: "financial",
      label: "Three-year revenue trajectory",
      detail: `${Math.round(revenueGrowth * 100)}% synthetic revenue growth from 2023 to 2025.`,
      strength: revenueGrowth >= 0.1 ? "strong" : "medium",
      source: "Synthetic financial statements",
      classification: "known",
    }),
    evidenceSignal(business.id, 2, {
      type: "commercial",
      label: "Recurring service base",
      detail: `${Math.round(business.recurring_revenue_ratio * 100)}% estimated recurring maintenance or service revenue.`,
      strength: business.recurring_revenue_ratio >= 0.7 ? "strong" : business.recurring_revenue_ratio >= 0.5 ? "medium" : "weak",
      source: "Synthetic commercial profile",
      classification: "inferred",
    }),
    evidenceSignal(business.id, 3, {
      type: "operations",
      label: "Management depth",
      detail:
        business.management_visibility >= 0.58
          ? "A visible synthetic operating layer supports continuity beyond the dirigeant."
          : "The synthetic profile shows limited management depth beyond the dirigeant.",
      strength: business.management_visibility >= 0.58 ? "strong" : "medium",
      source: "Synthetic organization profile",
      classification: "inferred",
    }),
    evidenceSignal(business.id, 4, {
      type: "financial",
      label: "Customer concentration",
      detail: `Top-customer exposure is estimated at ${Math.round(business.customer_concentration_ratio * 100)}%.`,
      strength: business.customer_concentration_ratio <= 0.18 ? "strong" : business.customer_concentration_ratio <= 0.28 ? "medium" : "weak",
      source: "Synthetic customer ledger summary",
      classification: "inferred",
    }),
    evidenceSignal(business.id, 5, {
      type: "website",
      label: "Digital operating signal",
      detail: `Synthetic digital maturity is ${Math.round(business.digital_maturity * 100)}/100; the website was refreshed ${business.website_freshness_years} years ago.`,
      strength: business.digital_maturity >= 0.62 ? "strong" : "medium",
      source: "Synthetic web snapshot",
      classification: "inferred",
    }),
    evidenceSignal(business.id, 6, {
      type: "leadership",
      label: "Leadership continuity",
      detail: `${business.leadership_tenure_years} years of synthetic leadership continuity; this is a tenure observation, not a person-level attribute.`,
      strength: business.leadership_tenure_years >= 22 ? "strong" : "medium",
      source: "Synthetic registry timeline",
      classification: "known",
    }),
    evidenceSignal(business.id, 7, {
      type: "reviews",
      label: "Local reputation",
      detail: `${business.review_rating.toFixed(1)}/5 across ${business.review_count} synthetic customer reviews.`,
      strength: business.review_rating >= 4.5 && business.review_count >= 80 ? "strong" : "medium",
      source: "Synthetic review index",
      classification: "known",
    }),
  ];
}

export function createSyntheticBusinesses(): SyntheticBusiness[] {
  const sectorList = Object.keys(sectorConfig) as Sector[];

  return Array.from({ length: SYNTHETIC_BUSINESS_COUNT }, (_, index) => {
    const sectorIndex = index % sectorList.length;
    const sector = sectorList[sectorIndex];
    const config = sectorConfig[sector];
    const companyRound = Math.floor(index / sectorList.length);
    const dataSeed = companyRound * 101 + sectorIndex * 17 + 1;
    const sectorOffset = sectorIndex * 3;
    const location =
      locations[(companyRound * 7 + sectorOffset) % locations.length];
    const serial = String(index + 1).padStart(4, "0");
    const id = `syn-fr-${sector.replaceAll("_", "-")}-${serial}`;
    const sizeFactor = 0.48 + ((dataSeed * 37) % 185) / 100;
    const revenue = rounded(config.revenueBase * sizeFactor, 10_000);
    const margin = clamp(config.marginBase + (((dataSeed * 13) % 91) - 42) / 1000, 0.075, 0.275);
    const recurring = clamp(config.recurringBase + (((dataSeed * 17) % 45) - 22) / 100, 0.22, 0.94);
    const concentration = clamp(0.11 + ((dataSeed * 19) % 29) / 100, 0.1, 0.42);
    const capex = clamp(config.capexBase + (((dataSeed * 5) % 31) - 15) / 1000, 0.012, 0.095);
    const foundedYear = 1981 + ((dataSeed * 11) % 39);
    const leadershipTenure = 7 + ((dataSeed * 23) % 30);
    const managementVisibility = clamp(0.24 + ((dataSeed * 29) % 67) / 100, 0.2, 0.9);
    const ownerProminence = clamp(0.38 + ((dataSeed * 31) % 59) / 100, 0.35, 0.96);
    const digitalMaturity = clamp(0.3 + ((dataSeed * 41) % 66) / 100, 0.28, 0.95);
    const contactability = clamp(0.5 + ((dataSeed * 43) % 48) / 100, 0.5, 0.97);
    const successorVisible =
      dataSeed % 4 === 0 || managementVisibility > 0.76;
    const leadershipChanges =
      dataSeed % 17 === 0 ? 2 : dataSeed % 9 === 0 ? 1 : 0;
    const publicMention = dataSeed % 29 === 0;
    const financialHistory = makeFinancialHistory(
      revenue,
      margin,
      capex,
      dataSeed,
    );
    const debt = rounded(
      revenue * (0.04 + ((dataSeed * 47) % 19) / 100),
      10_000,
    );
    const transitionSignals = makeTransitionSignals(
      id,
      leadershipTenure,
      successorVisible,
      leadershipChanges,
      publicMention,
    );
    const contactPaths = makeContacts(id, contactability);
    const baseName = config.names[companyRound % config.names.length];

    const withoutEvidence: Omit<SyntheticBusiness, "evidence"> = {
      id,
      name: `${baseName} ${location.city} ${serial} — Démo`,
      sector,
      region: location.region,
      city: location.city,
      department: location.department,
      latitude: location.latitude + (((dataSeed % 5) - 2) * 0.018),
      longitude:
        location.longitude + ((((dataSeed + 2) % 5) - 2) * 0.022),
      founded_year: foundedYear,
      employee_estimate: Math.max(
        4,
        rounded(revenue / (88_000 + ((dataSeed * 7) % 38_000))),
      ),
      revenue_estimate_eur: revenue,
      ebitda_margin: Number(margin.toFixed(3)),
      recurring_revenue_ratio: Number(recurring.toFixed(2)),
      customer_concentration_ratio: Number(concentration.toFixed(2)),
      maintenance_capex_ratio: Number(capex.toFixed(3)),
      debt_eur: debt,
      review_rating: Number((4 + ((dataSeed * 3) % 10) / 10).toFixed(1)),
      review_count: 18 + ((dataSeed * 53) % 240),
      website_freshness_years: 1 + ((dataSeed * 7) % 7),
      digital_maturity: Number(digitalMaturity.toFixed(2)),
      management_visibility: Number(managementVisibility.toFixed(2)),
      owner_contact_prominence: Number(ownerProminence.toFixed(2)),
      leadership_tenure_years: leadershipTenure,
      leadership_changes_3y: leadershipChanges,
      successor_visible: successorVisible,
      public_transition_mention: publicMention,
      hiring_signal: dataSeed % 3 === 0 || dataSeed % 11 === 0,
      contactability: Number(contactability.toFixed(2)),
      financial_history: financialHistory,
      transition_signals: transitionSignals,
      contact_paths: contactPaths,
    };

    return {
      ...withoutEvidence,
      evidence: makeEvidence(withoutEvidence),
    };
  });
}

export const syntheticBusinesses = createSyntheticBusinesses();

export const sectorLabels: Record<Sector, string> = Object.fromEntries(
  Object.entries(sectorConfig).map(([sector, config]) => [sector, config.label]),
) as Record<Sector, string>;

export const sectorValuationMultiples: Record<Sector, number> = Object.fromEntries(
  Object.entries(sectorConfig).map(([sector, config]) => [sector, config.multiple]),
) as Record<Sector, number>;

export const businessRegions = Array.from(
  new Set(locations.map((location) => location.region)),
);
