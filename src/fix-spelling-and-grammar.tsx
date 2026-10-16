import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Detail,
  getPreferenceValues,
  getSelectedText,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { Change, escapeMarkdown, proofreadDiff } from "./diff-markdown";

const PROMPT = `You are a proofreader. Fix only spelling, grammar and punctuation errors in the text.
Rules:
- Make minimal, precise edits. Do NOT rewrite, rephrase, reorder words or change word choice, tone or style.
- Keep the original language. Never translate.
- Keep formatting exactly: line breaks, lists, markdown, \`code\`, URLs, emoji, and the casing of informal text.
- If the text has no errors, return it unchanged.
- Reply with the corrected text only: no explanations, no quotes, no preamble.

Examples:
Input: She dont like the new design, its to dark.
Output: She doesn't like the new design, it's too dark.
Input: Let me know when your done
Output: Let me know when you're done
Input: Thanks, merged it 👍
Output: Thanks, merged it 👍

Text:
`;

type Input = { text: string; fromClipboard: boolean };

async function getInput(): Promise<Input> {
  const selected = (await getSelectedText().catch(() => "")).trim();
  if (selected) return { text: selected, fromClipboard: false };
  return { text: ((await Clipboard.readText()) ?? "").trim(), fromClipboard: true };
}

async function fixText(text: string, model: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: PROMPT + text, stream: false, think: false, options: { temperature: 0 } }),
    });
  } catch {
    throw new Error("Start Ollama first. It is not running on localhost:11434.");
  }
  const data = (await res.json().catch(() => ({}))) as { response?: string; error?: string };
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${data.error ?? res.statusText}`);
  return (data.response ?? "").trim();
}

async function check(model: string): Promise<{ fixed: string; markdown: string; changes: Change[] }> {
  const { text: input, fromClipboard } = await getInput();
  if (!input) throw new Error("Select some text or copy it to the clipboard first.");
  const { text, markdown, changes } = proofreadDiff(input, await fixText(input, model));
  const body = text === input ? `✅ No mistakes found.\n\n${escapeMarkdown(text)}` : markdown;
  return { fixed: text, markdown: fromClipboard ? `_📋 From clipboard_\n\n${body}` : body, changes };
}

function changeTag({ from, to }: Change, index: number) {
  if (!to) return <Detail.Metadata.TagList.Item key={index} text={`− ${from}`} color={Color.Red} />;
  return <Detail.Metadata.TagList.Item key={index} text={from ? `${from} → ${to}` : `+ ${to}`} color={Color.Green} />;
}

export default function Command() {
  const { model } = getPreferenceValues<{ model: string }>();
  const [markdown, setMarkdown] = useState("Checking…");
  const [fixed, setFixed] = useState("");
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const run = useRef<ReturnType<typeof check>>(null);

  useEffect(() => {
    run.current ??= check(model);
    run.current
      .then((result) => {
        setFixed(result.fixed);
        setMarkdown(result.markdown);
        setChanges(result.changes);
      })
      .catch(async (e) => {
        const msg = e instanceof Error ? e.message : String(e);
        await showToast({ style: Toast.Style.Failure, title: "Failed", message: msg });
        setMarkdown(`**Error:** ${msg}`);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Detail
      isLoading={loading}
      markdown={markdown}
      metadata={
        changes.length > 0 ? (
          <Detail.Metadata>
            <Detail.Metadata.TagList title="Changes">{changes.map(changeTag)}</Detail.Metadata.TagList>
          </Detail.Metadata>
        ) : undefined
      }
      actions={
        fixed ? (
          <ActionPanel>
            <Action.CopyToClipboard title="Copy Corrected Text" content={fixed} />
            <Action.Paste title="Paste Corrected Text" content={fixed} />
          </ActionPanel>
        ) : undefined
      }
    />
  );
}
