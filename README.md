# Proofreader

Raycast commands that fix spelling and grammar, and rewrite text in Simplified Technical English, with a local AI model running in [Ollama](https://ollama.com). They are a free, private alternative to Raycast AI's "Fix Spelling and Grammar" and "Quick Fix": your text never leaves your Mac.

## Fix Spelling and Grammar

Select text in any app, run **Fix Spelling and Grammar**, and Proofreader shows only what changed:

- removed words are ~~struck through~~
- new or corrected words are green
- a **Changes** panel lists each edit, e.g. `has alot → have a lot`

Press <kbd>↵</kbd> to copy the corrected text, or <kbd>⌘</kbd><kbd>K</kbd> → **Paste Corrected Text**.

If nothing is selected, Proofreader checks the clipboard text instead and marks the result with **📋 From clipboard**.

## Quick Fix

Select text in any app and run **Quick Fix**. Proofreader replaces the selection with the corrected text, without opening a window, and reports `✏️ Fixed 2 mistakes` or `✅ No mistakes found`. If the model takes longer than a second (for example while it loads), `Fixing…` is shown.

Quick Fix only works on selected text; it does not fall back to the clipboard. It is meant to run from a hotkey.

## Rewrite in Simplified Technical English

Select text and run **Rewrite in Simplified Technical English**. Proofreader rewrites it in [ASD-STE100 Simplified Technical English](https://www.asd-ste100.org) (STE) and shows the changes in the same view as **Fix Spelling and Grammar**, with the same clipboard fallback and actions.

The prompt asks for the core STE rules: simple tenses, no `-ing` forms, phrasal verbs or contractions, the active voice, one topic and at most 20 words (instructions) or 25 words (descriptions) per sentence, commands for instructions, no noun groups longer than 3 words, no semicolons, no "e.g.", "i.e." or "etc.", and simple words ("use", not "utilize"). It also keeps the tense, the cause and condition words, technical names and `code` from the original.

A local model does not know the STE dictionary of approved words, so the result is closer to STE, not certified STE. Small models also ignore some rules, most often the noun-group limit. Read the changes before you use the text.

## Requirements

- macOS on Apple Silicon
- [Raycast](https://raycast.com)
- [Ollama](https://ollama.com/download) (the app starts its server at login)
- Node.js 22.6 or newer

## Setup

1. Download a model (see [Choosing a model](#choosing-a-model)):

   ```bash
   ollama pull qwen3.6:35b
   ```

2. Install the dependencies and start the extension in development mode:

   ```bash
   npm install
   npm run dev
   ```

3. In Raycast, search for **Fix Spelling and Grammar**, **Quick Fix** or **Rewrite in Simplified Technical English**. Assign hotkeys in Raycast Settings → Extensions → Proofreader.

## Choosing a model

Set the model in Raycast Settings → Extensions → Proofreader → **Ollama Model**. The default is `qwen3.6:35b`.

| Your RAM | Model | Memory | Notes |
|---|---|---|---|
| 32 GB or more | `qwen3.6:35b` | ~24 GB | Best results: 34 of 34 test sentences correct, ~0.3 s per check |
| 32 GB or more | `gemma4:26b` | ~17 GB | Close second, lighter |
| 16 GB | `gemma4:e4b-it-qat` | ~5.7 GB | Best fit for 16 GB: 96% of errors fixed, leaves room for other apps |

Ollama unloads a model after 5 minutes without use, so the first check after a break waits for it to load (about 2 s for `gemma4:e4b-it-qat`, 11 s for `qwen3.6:35b`).

On a Mac, pull `gemma4:e4b-it-qat`, not `gemma4:e4b`: the default tag downloads a 9.5 GB variant that is too large for 16 GB.

## Troubleshooting

| Message or symptom | Fix |
|---|---|
| `Select some text first` (Quick Fix) | The app did not report a selection. Select the text again, or use **Fix Spelling and Grammar**, which also reads the clipboard. |
| `Start Ollama first` | Open the Ollama app. |
| `Ollama error 404: model '…' not found` | Run `ollama pull <model>`, or fix the model name in the extension preferences. |
| A correct sentence is shown as changed | Small models over-correct. Use a larger model from the table. |
| The old icon still shows after changing it | Raycast caches icons by file name. Rename the icon file. |
| `npm install` fails with `ETARGET` | A security wrapper such as Aikido Safe-chain may hide very new package versions. Don't turn it off; use an older version of the package. |

## How it works

1. The command reads the selected text (the commands with a view fall back to the clipboard).
2. It sends the text to Ollama at `http://localhost:11434/api/generate` with the command's prompt (`src/prompts.ts`), `temperature: 0` and `think: false`.
3. It compares the original and corrected text word by word (`src/diff-markdown.ts`). Changes in quote style (`'` vs `’`) are not counted as edits.
4. Fix Spelling and Grammar and Rewrite in Simplified Technical English render the differences in a Raycast `Detail` view; Quick Fix pastes the corrected text over the selection, keeping its leading and trailing whitespace.

The model only returns the corrected text; the highlighting is computed locally, so it is always accurate to what changed.

## Development

```bash
npm run dev     # run in Raycast with hot reload
npm run lint    # ESLint + Prettier
npm run build   # type-check and build
npm test        # unit tests for the word diff
npm run bench -- qwen3.6:35b gemma4:e4b-it-qat   # benchmark the prompt on local models
```

The benchmark sends each sentence in `bench/cases.mjs` through the same request as the extension and prints a Markdown table. The raw answers go to `bench/results.json`.
