import { diffArrays } from "diff";
import { writeFileSync } from "node:fs";
import { dropAddedFinalPeriod } from "../src/final-period.ts";
import { rewrite } from "../src/ollama.ts";
import { FIX_SPELLING_AND_GRAMMAR } from "../src/prompts.ts";
import * as sets from "./cases.mjs";

const OLLAMA = "http://localhost:11434";

const norm = (t) =>
  t
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[ \t]+$/gm, "")
    .trim();
const tok = (t) => norm(t).split(/(\s+)/).filter(Boolean);

function edits(src, dst) {
  const out = [];
  let i = 0;
  let cur = null;
  for (const p of diffArrays(tok(src), tok(dst))) {
    if (p.added) (cur ??= { s: i, e: i, r: "" }).r += p.value.join("");
    else if (p.removed) {
      cur ??= { s: i, e: i, r: "" };
      i += p.value.length;
      cur.e = i;
    } else {
      if (cur) out.push(cur);
      cur = null;
      i += p.value.length;
    }
  }
  if (cur) out.push(cur);
  return out.map((x) => `${x.s}:${x.e}:${x.r.trim()}`);
}

// A case with no refs is correct text and must come back unchanged.
function score(input, output, refs) {
  const hyp = new Set(edits(input, output));
  let best = null;
  for (const ref of refs.length ? refs : [input]) {
    const gold = new Set(edits(input, ref));
    const tp = [...hyp].filter((e) => gold.has(e)).length;
    const p = hyp.size ? tp / hyp.size : 1;
    const r = gold.size ? tp / gold.size : 1;
    const f = p + r === 0 ? 0 : (1.25 * p * r) / (0.25 * p + r);
    const exact = norm(output) === norm(ref);
    if (!best || exact > best.exact || (exact === best.exact && f > best.f)) best = { f, exact };
  }
  return best;
}

async function warmUp(model) {
  const t = performance.now();
  await rewrite("Reply with OK.", "", model);
  const { models } = await (await fetch(`${OLLAMA}/api/ps`)).json();
  const loaded = models.find((m) => m.name === model || m.model === model);
  return { coldMs: performance.now() - t, memGB: loaded ? loaded.size / 1e9 : NaN };
}

const unload = (model) =>
  fetch(`${OLLAMA}/api/generate`, { method: "POST", body: JSON.stringify({ model, keep_alive: 0 }) });

const models = process.argv.slice(2);
if (!models.length) {
  console.error("Usage: npm run bench -- <model> [<model> ...]");
  process.exit(1);
}

const rows = [];
const summary = [];
for (const model of models) {
  await unload(model);
  const { coldMs, memGB } = await warmUp(model);
  for (const [set, cases] of Object.entries(sets)) {
    for (const c of cases) {
      const t = performance.now();
      const output = await rewrite(FIX_SPELLING_AND_GRAMMAR, c.input, model)
        .then((fixed) => dropAddedFinalPeriod(c.input, fixed))
        .catch((e) => `ERROR ${e.message}`);
      rows.push({
        model,
        set,
        lang: c.lang,
        clean: !c.refs.length,
        input: c.input,
        output,
        ms: performance.now() - t,
        ...score(c.input, output, c.refs),
      });
    }
  }
  await unload(model);
  summary.push({ model, coldMs, memGB });
}
writeFileSync(new URL("./results.json", import.meta.url), JSON.stringify(rows, null, 1));

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const exact = (rs) => (rs.length ? `${rs.filter((r) => r.exact).length}/${rs.length}` : "–");
const tableRow = (cells) => console.log(`| ${cells.join(" | ")} |`);
const header = [
  "Model",
  "Set",
  "Errors fixed",
  "Edit F0.5",
  "Correct text kept",
  "EN",
  "PL",
  "Median time",
  "Load time",
  "Memory",
];
tableRow(header);
tableRow(header.map(() => "---"));
for (const { model, coldMs, memGB } of summary) {
  for (const set of Object.keys(sets)) {
    const rs = rows.filter((r) => r.model === model && r.set === set);
    const errors = rs.filter((r) => !r.clean);
    tableRow([
      model,
      set,
      exact(errors),
      (errors.reduce((s, r) => s + r.f, 0) / errors.length).toFixed(2),
      exact(rs.filter((r) => r.clean)),
      exact(rs.filter((r) => r.lang === "en")),
      exact(rs.filter((r) => r.lang === "pl")),
      `${(median(rs.map((r) => r.ms)) / 1000).toFixed(2)} s`,
      `${(coldMs / 1000).toFixed(1)} s`,
      `${memGB.toFixed(1)} GB`,
    ]);
  }
}
