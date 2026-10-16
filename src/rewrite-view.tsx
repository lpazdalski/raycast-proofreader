import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Detail,
  getSelectedText,
  Icon,
  openExtensionPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { Change, plainMarkdown, proofreadDiff } from "./diff-markdown";
import { Corrected } from "./proofread";

type Correct = (text: string) => Promise<string>;
type Result = Corrected & { diff: string; changes: Change[]; fromClipboard: boolean };

async function getInput(): Promise<{ text: string; fromClipboard: boolean }> {
  const selected = (await getSelectedText().catch(() => "")).trim();
  if (selected) return { text: selected, fromClipboard: false };
  return { text: ((await Clipboard.readText()) ?? "").trim(), fromClipboard: true };
}

function compare({ input, fixed, before, after }: Corrected, fromClipboard: boolean): Result {
  const { text, markdown, changes } = proofreadDiff(input, fixed);
  return { input, fixed: text, before, after, diff: markdown, changes, fromClipboard };
}

async function check(correct: Correct, given?: Corrected): Promise<Result> {
  if (given) return compare(given, false);
  const { text: input, fromClipboard } = await getInput();
  if (!input) throw new Error("Select some text or copy it to the clipboard first.");
  return compare({ input, fixed: await correct(input), before: "", after: "" }, fromClipboard);
}

function body({ input, fixed, diff, fromClipboard }: Result, unchanged: string, showDiff: boolean): string {
  const text = fixed === input ? `✅ ${unchanged}\n\n${plainMarkdown(fixed)}` : showDiff ? diff : plainMarkdown(fixed);
  return fromClipboard ? `_📋 From clipboard_\n\n${text}` : text;
}

function changeTag({ from, to }: Change, index: number) {
  if (!to) return <Detail.Metadata.TagList.Item key={index} text={`− ${from}`} color={Color.Red} />;
  return <Detail.Metadata.TagList.Item key={index} text={from ? `${from} → ${to}` : `+ ${to}`} color={Color.Green} />;
}

type Props = { correct: Correct; unchanged: string; showChanges?: boolean; diffFirst?: boolean; given?: Corrected };

export function RewriteView({ correct, unchanged, showChanges = true, diffFirst = true, given }: Props) {
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<string>();
  const [showDiff, setShowDiff] = useState(diffFirst);
  const run = useRef<Promise<Result>>(null);

  useEffect(() => {
    run.current ??= check(correct, given);
    run.current.then(setResult).catch(async (e) => {
      const msg = e instanceof Error ? e.message : String(e);
      await showToast({ style: Toast.Style.Failure, title: "Failed", message: msg });
      setError(msg);
    });
  }, []);

  if (error) {
    return (
      <Detail
        markdown={`**Error:** ${plainMarkdown(error)}`}
        actions={
          <ActionPanel>
            <Action title="Open Extension Settings" icon={Icon.Gear} onAction={openExtensionPreferences} />
          </ActionPanel>
        }
      />
    );
  }
  if (!result) return <Detail isLoading markdown="Checking…" />;

  return (
    <Detail
      markdown={body(result, unchanged, showDiff)}
      metadata={
        showChanges && result.changes.length > 0 ? (
          <Detail.Metadata>
            <Detail.Metadata.TagList title="Changes">{result.changes.map(changeTag)}</Detail.Metadata.TagList>
          </Detail.Metadata>
        ) : undefined
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Corrected Text" content={result.fixed} />
          <Action.Paste title="Paste Corrected Text" content={result.before + result.fixed + result.after} />
          {result.fixed !== result.input && (
            <Action
              title={showDiff ? "Hide Changes" : "Show Changes"}
              icon={Icon.Eye}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
              onAction={() => setShowDiff(!showDiff)}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
