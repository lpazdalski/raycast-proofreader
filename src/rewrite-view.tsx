import { Action, ActionPanel, Clipboard, Color, Detail, getSelectedText, showToast, Toast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { Change, escapeMarkdown, proofreadDiff } from "./diff-markdown";

type Input = { text: string; fromClipboard: boolean };

async function getInput(): Promise<Input> {
  const selected = (await getSelectedText().catch(() => "")).trim();
  if (selected) return { text: selected, fromClipboard: false };
  return { text: ((await Clipboard.readText()) ?? "").trim(), fromClipboard: true };
}

type Correct = (text: string) => Promise<string>;

async function check(
  correct: Correct,
  unchanged: string,
): Promise<{ fixed: string; markdown: string; changes: Change[] }> {
  const { text: input, fromClipboard } = await getInput();
  if (!input) throw new Error("Select some text or copy it to the clipboard first.");
  const { text, markdown, changes } = proofreadDiff(input, await correct(input));
  const body = text === input ? `✅ ${unchanged}\n\n${escapeMarkdown(text)}` : markdown;
  return { fixed: text, markdown: fromClipboard ? `_📋 From clipboard_\n\n${body}` : body, changes };
}

function changeTag({ from, to }: Change, index: number) {
  if (!to) return <Detail.Metadata.TagList.Item key={index} text={`− ${from}`} color={Color.Red} />;
  return <Detail.Metadata.TagList.Item key={index} text={from ? `${from} → ${to}` : `+ ${to}`} color={Color.Green} />;
}

type Props = { correct: Correct; unchanged: string; showChanges?: boolean };

export function RewriteView({ correct, unchanged, showChanges = true }: Props) {
  const [markdown, setMarkdown] = useState("Checking…");
  const [fixed, setFixed] = useState("");
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const run = useRef<ReturnType<typeof check>>(null);

  useEffect(() => {
    run.current ??= check(correct, unchanged);
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
        showChanges && changes.length > 0 ? (
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
