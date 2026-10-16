import { Clipboard, closeMainWindow, getSelectedText, launchCommand, LaunchType, showHUD } from "@raycast/api";
import { isTooManyChanges, proofreadDiff } from "./diff-markdown";
import { Corrected, fixSpellingAndGrammar } from "./proofread";

const SLOW_MS = 1000;

const plural = (n: number) => `${n} ${n === 1 ? "mistake" : "mistakes"}`;

export default async function Command() {
  const selected = await getSelectedText().catch(() => "");
  const [, before, input, after] = selected.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
  if (!input) return showHUD("Select some text first");

  await closeMainWindow();
  const slow = setTimeout(() => showHUD("Fixing…"), SLOW_MS);
  try {
    const { text, changes } = proofreadDiff(input, await fixSpellingAndGrammar(input));
    clearTimeout(slow);
    if (text === input) return showHUD("✅ No mistakes found");
    if (isTooManyChanges(input, text)) {
      const context: Corrected = { input, fixed: text, before, after };
      return launchCommand({ name: "fix-spelling-and-grammar", type: LaunchType.UserInitiated, context });
    }
    await Clipboard.paste(before + text + after);
    await showHUD(`✏️ Fixed ${plural(changes.length)}`);
  } catch (e) {
    clearTimeout(slow);
    await showHUD(`❌ ${e instanceof Error ? e.message : String(e)}`);
  }
}
