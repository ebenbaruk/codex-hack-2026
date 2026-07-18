import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { z } from "zod";
import {
  campaignOutputSchema,
  inputJsonSchema,
} from "../src/lib/buyable/schema";
import { defaultAcquisitionInput } from "../src/lib/buyable/engine";

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

const outputSchema = {
  ...z.toJSONSchema(campaignOutputSchema),
  title: "Buyable acquisition conviction list",
  description:
    "A market funnel, ten explainable conviction targets and a complete acquisition Deal Pack for the top business.",
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
    "Give Codex the acquisition intelligence to find, prove and pursue the best private businesses to buy.",
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
