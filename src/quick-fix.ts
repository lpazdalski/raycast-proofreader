import { Clipboard, closeMainWindow, getPreferenceValues, getSelectedText, showHUD } from "@raycast/api";
import { proofreadDiff } from "./diff-markdown";
import { fixText } from "./ollama";

const SLOW_MS = 1000;

const plural = (n: number) => `${n} ${n === 1 ? "mistake" : "mistakes"}`;

export default async function Command() {
  const { model } = getPreferenceValues<{ model: string }>();
  const selected = await getSelectedText().catch(() => "");
  const [, before, input, after] = selected.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
  if (!input) return showHUD("Select some text first");

  await closeMainWindow();
  const slow = setTimeout(() => showHUD("Fixing…"), SLOW_MS);
  try {
    const { text, changes } = proofreadDiff(input, await fixText(input, model));
    clearTimeout(slow);
    if (text === input) return showHUD("✅ No mistakes found");
    await Clipboard.paste(before + text + after);
    await showHUD(`✏️ Fixed ${plural(changes.length)}`);
  } catch (e) {
    clearTimeout(slow);
    await showHUD(`❌ ${e instanceof Error ? e.message : String(e)}`);
  }
}
