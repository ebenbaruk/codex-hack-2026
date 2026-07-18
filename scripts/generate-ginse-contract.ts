import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { inputJsonSchema } from "../src/lib/buyable/schema";
import { defaultAcquisitionInput } from "../src/lib/buyable/engine";
import { DISCLOSURE, regions, sectors } from "../src/lib/buyable/types";

const ginseDirectory = new URL("../ginse/", import.meta.url);
const publicManifestUrl = new URL(
  "../public/.well-known/ginse.json",
  import.meta.url,
);
const rootManifestUrl = new URL("../.well-known/ginse.json", import.meta.url);
mkdirSync(ginseDirectory, { recursive: true });
mkdirSync(new URL("../public/.well-known/", import.meta.url), {
  recursive: true,
});
mkdirSync(new URL("../.well-known/", import.meta.url), { recursive: true });

const inputSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Buyable acquisition search",
  description:
    "A buyer thesis used to scan, rank and package synthetic private-business acquisition targets across France.",
  ...inputJsonSchema,
};

const stringArray = {
  type: "array",
  items: { type: "string" },
} as const;

const targetSummarySchema = {
  type: "object",
  required: [
    "id",
    "name",
    "sector",
    "region",
    "city",
    "conviction_score",
    "confidence",
    "estimated_financials",
    "valuation_range_eur",
    "evidence",
    "inferences",
    "unknowns",
    "why_buy",
    "why_not",
    "next_action",
    "listed_for_sale",
  ],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    sector: { type: "string", enum: [...sectors] },
    region: {
      type: "string",
      enum: regions.filter((region) => region !== "France"),
    },
    city: { type: "string" },
    conviction_score: { type: "integer", minimum: 0, maximum: 100 },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    estimated_financials: {
      type: "object",
      required: [
        "revenue_eur",
        "ebitda_eur",
        "ebitda_margin",
        "recurring_revenue_ratio",
        "free_cash_flow_eur",
      ],
      properties: {
        revenue_eur: { type: "integer" },
        ebitda_eur: { type: "integer" },
        ebitda_margin: { type: "number" },
        recurring_revenue_ratio: { type: "number" },
        free_cash_flow_eur: { type: "integer" },
      },
    },
    valuation_range_eur: {
      type: "object",
      required: ["low", "high", "midpoint", "methodology"],
      properties: {
        low: { type: "integer" },
        high: { type: "integer" },
        midpoint: { type: "integer" },
        methodology: { type: "string" },
      },
    },
    evidence: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: [
          "label",
          "detail",
          "source",
          "strength",
          "classification",
        ],
        properties: {
          label: { type: "string" },
          detail: { type: "string" },
          source: { type: "string" },
          strength: {
            type: "string",
            enum: ["strong", "medium", "weak"],
          },
          classification: {
            type: "string",
            enum: ["known", "inferred"],
          },
        },
      },
    },
    inferences: stringArray,
    unknowns: stringArray,
    why_buy: stringArray,
    why_not: stringArray,
    next_action: { type: "string" },
    listed_for_sale: { type: "boolean", const: false },
  },
} as const;

const outputSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  title: "Buyable acquisition conviction list",
  description:
    "A market funnel, ten explainable conviction targets and a complete acquisition Deal Pack for the top business.",
  required: [
    "schema_version",
    "campaign_id",
    "generated_at",
    "disclosure",
    "thesis_summary",
    "applied_filters",
    "market_funnel",
    "rejection_reasons",
    "targets",
    "conviction_targets",
    "top_target_id",
    "ranking_explanation",
    "top_acquisition_case",
    "financing_snapshot",
    "offer_scenarios",
    "outreach_packet",
    "generated_artifacts",
    "codex_response",
    "campaign_url",
  ],
  properties: {
    schema_version: { type: "string", const: "2" },
    campaign_id: { type: "string" },
    generated_at: { type: "string" },
    disclosure: { type: "string", const: DISCLOSURE },
    thesis_summary: { type: "string" },
    applied_filters: inputJsonSchema,
    market_funnel: {
      type: "object",
      required: [
        "universe_scanned",
        "thesis_compatible",
        "economically_solid",
        "financeable",
        "transition_relevant",
        "conviction_list",
      ],
      properties: {
        universe_scanned: { type: "integer" },
        thesis_compatible: { type: "integer" },
        economically_solid: { type: "integer" },
        financeable: { type: "integer" },
        transition_relevant: { type: "integer" },
        conviction_list: { type: "integer", const: 10 },
      },
    },
    rejection_reasons: {
      type: "array",
      maxItems: 10,
      items: {
        type: "object",
        required: ["reason", "count", "detail"],
        properties: {
          reason: { type: "string" },
          count: { type: "integer" },
          detail: { type: "string" },
        },
      },
    },
    targets: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: targetSummarySchema,
    },
    conviction_targets: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      description:
        "The same ten targets, retained as the explicit V2 conviction-list field.",
      items: { type: "object" },
    },
    top_target_id: { type: "string" },
    ranking_explanation: {
      type: "object",
      required: [
        "headline",
        "why_number_one_wins",
        "methodology",
        "limitation",
      ],
      properties: {
        headline: { type: "string" },
        why_number_one_wins: stringArray,
        methodology: { type: "string" },
        limitation: { type: "string" },
      },
    },
    top_acquisition_case: {
      type: "object",
      required: [
        "target_id",
        "executive_summary",
        "investment_thesis",
        "key_risks",
        "loi_draft",
        "hundred_day_plan",
      ],
      properties: {
        target_id: { type: "string" },
        executive_summary: { type: "string" },
        investment_thesis: stringArray,
        key_risks: stringArray,
        loi_draft: { type: "string" },
        hundred_day_plan: { type: "array", items: { type: "object" } },
      },
    },
    financing_snapshot: {
      type: "object",
      required: [
        "target_id",
        "midpoint_valuation_eur",
        "buyer_cash_eur",
        "senior_debt_eur",
        "seller_note_eur",
        "earnout_eur",
        "estimated_dscr",
        "disclaimer",
      ],
      properties: {
        target_id: { type: "string" },
        midpoint_valuation_eur: { type: "integer" },
        buyer_cash_eur: { type: "integer" },
        senior_debt_eur: { type: "integer" },
        seller_note_eur: { type: "integer" },
        earnout_eur: { type: "integer" },
        estimated_dscr: { type: "number" },
        disclaimer: { type: "string" },
      },
    },
    offer_scenarios: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        required: [
          "id",
          "label",
          "enterprise_value_eur",
          "buyer_cash_eur",
          "senior_debt_eur",
          "seller_note_eur",
          "earnout_eur",
          "estimated_dscr",
          "feasible",
        ],
        properties: {
          id: {
            type: "string",
            enum: ["balanced", "seller_aligned", "cash_forward"],
          },
          label: { type: "string" },
          enterprise_value_eur: { type: "integer" },
          buyer_cash_eur: { type: "integer" },
          senior_debt_eur: { type: "integer" },
          seller_note_eur: { type: "integer" },
          earnout_eur: { type: "integer" },
          estimated_dscr: { type: "number" },
          feasible: { type: "boolean" },
        },
      },
    },
    outreach_packet: {
      type: "object",
      required: [
        "target_id",
        "email_subject",
        "email_body",
        "call_opener",
        "first_meeting_questions",
        "diligence_questions",
      ],
      properties: {
        target_id: { type: "string" },
        email_subject: { type: "string" },
        email_body: { type: "string" },
        call_opener: { type: "string" },
        first_meeting_questions: stringArray,
        diligence_questions: stringArray,
      },
    },
    generated_artifacts: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        required: ["id", "type", "title", "status", "review_required"],
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          title: { type: "string" },
          status: { type: "string", const: "draft" },
          review_required: { type: "boolean", const: true },
        },
      },
    },
    codex_response: {
      type: "object",
      description:
        "A concise, ready-to-display answer for Codex, followed by useful next actions and follow-up prompts.",
      required: [
        "answer_markdown",
        "key_takeaways",
        "recommended_next_actions",
        "suggested_follow_up_prompts",
      ],
      properties: {
        answer_markdown: { type: "string", minLength: 200 },
        key_takeaways: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: { type: "string" },
        },
        recommended_next_actions: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: { type: "string" },
        },
        suggested_follow_up_prompts: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string" },
        },
      },
    },
    campaign_url: { type: "string", format: "uri" },
  },
};

writeFileSync(
  new URL("input-schema.json", ginseDirectory),
  `${JSON.stringify(inputSchema, null, 2)}\n`,
);
writeFileSync(
  new URL("output-schema.json", ginseDirectory),
  `${JSON.stringify(outputSchema, null, 2)}\n`,
);
writeFileSync(
  new URL("example-input.json", ginseDirectory),
  `${JSON.stringify(defaultAcquisitionInput, null, 2)}\n`,
);

const existingManifest = existsSync(publicManifestUrl)
  ? (JSON.parse(readFileSync(publicManifestUrl, "utf8")) as {
      ownership_token?: string;
      run_url?: string;
    })
  : {};

const manifest = {
  schema_version: "2",
  slug: "buyable",
  display_name: "Buyable",
  description:
    "Buyable gives Codex an acquisition team in one action: it scans 2,500 private businesses, ranks the best targets for your budget, explains why #1 wins, models financing and prepares the Deal Pack. Try: “Use Buyable to find the best service business around Lyon I can acquire with €250,000.”",
  presentation: {
    action: "Curate acquisition targets",
    input: {
      label: "Acquisition search",
      icon: "text",
    },
    output: {
      label: "Acquisition conviction list",
      icon: "table",
    },
  },
  price: {
    amount_cents: 99,
    currency: "EUR",
  },
  run_url:
    process.env.GINSE_RUN_URL ??
    existingManifest.run_url ??
    "https://codex-hack-2026.vercel.app/run",
  input_schema: inputSchema,
  output_schema: outputSchema,
  example: {
    input: defaultAcquisitionInput,
  },
  ...(existingManifest.ownership_token
    ? { ownership_token: existingManifest.ownership_token }
    : {}),
};

const manifestContents = `${JSON.stringify(manifest, null, 2)}\n`;
writeFileSync(publicManifestUrl, manifestContents);
writeFileSync(rootManifestUrl, manifestContents);

console.log("Generated Ginse v2 schemas, example, and public manifest.");
