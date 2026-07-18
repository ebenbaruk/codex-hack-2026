import { mkdirSync, writeFileSync } from "node:fs";
import { z } from "zod";
import {
  campaignOutputSchema,
  inputJsonSchema,
} from "../src/lib/buyable/schema";
import { defaultAcquisitionInput } from "../src/lib/buyable/engine";

const directory = new URL("../ginse/", import.meta.url);
mkdirSync(directory, { recursive: true });

writeFileSync(
  new URL("input-schema.json", directory),
  `${JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Buyable acquisition thesis",
      description:
        "A France local-services acquisition thesis for an evidence-backed synthetic target search.",
      ...inputJsonSchema,
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  new URL("output-schema.json", directory),
  `${JSON.stringify(
    {
      ...z.toJSONSchema(campaignOutputSchema),
      title: "Buyable qualified target pipeline",
      description:
        "Ten ranked synthetic off-market targets plus top-target financing and outreach preparation.",
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  new URL("example-input.json", directory),
  `${JSON.stringify(defaultAcquisitionInput, null, 2)}\n`,
);

console.log("Generated Ginse input, output, and example contracts.");
