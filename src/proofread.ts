import { getPreferenceValues } from "@raycast/api";
import { dropAddedFinalPeriod } from "./final-period";
import { rewrite } from "./ollama";
import { FIX_SPELLING_AND_GRAMMAR, SIMPLIFIED_TECHNICAL_ENGLISH } from "./prompts";

export async function fixSpellingAndGrammar(text: string): Promise<string> {
  const { model, noFinalPeriod } = getPreferenceValues<Preferences>();
  const fixed = await rewrite(FIX_SPELLING_AND_GRAMMAR, text, model);
  return noFinalPeriod ? dropAddedFinalPeriod(text, fixed) : fixed;
}

export function rewriteInSimplifiedTechnicalEnglish(text: string): Promise<string> {
  return rewrite(SIMPLIFIED_TECHNICAL_ENGLISH, text, getPreferenceValues<Preferences>().model);
}
