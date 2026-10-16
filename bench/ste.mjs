import { rewrite } from "../src/ollama.ts";
import { SIMPLIFIED_TECHNICAL_ENGLISH } from "../src/prompts.ts";
import * as sets from "./ste-cases.mjs";

const models = process.argv.slice(2);
if (!models.length) {
  console.error("Usage: npm run bench:ste -- <model> [<model> ...]");
  process.exit(1);
}

const cell = (text) => text.replace(/\|/g, "\\|").replace(/\n/g, "<br>");
console.log(`| Set | Input | ${models.join(" | ")} |`);
console.log(`| --- | --- | ${models.map(() => "---").join(" | ")} |`);
for (const [set, inputs] of Object.entries(sets)) {
  for (const input of inputs) {
    const outputs = [];
    for (const model of models) outputs.push(await rewrite(SIMPLIFIED_TECHNICAL_ENGLISH, input, model));
    console.log(`| ${set} | ${cell(input)} | ${outputs.map(cell).join(" | ")} |`);
  }
}
