# Proofreader

Raycast commands that fix spelling and grammar, and rewrite text in Simplified Technical English, with a local AI model running in [Ollama](https://ollama.com). They are a free, private alternative to Raycast AI's "Fix Spelling and Grammar" and "Quick Fix": your text never leaves your Mac.

## Fix Spelling and Grammar

Select text in any app, run **Fix Spelling and Grammar**, and Proofreader shows only what changed:

- removed words are ~~struck through~~
- new or corrected words are green
- a **Changes** panel lists each edit, e.g. `has alot → have a lot`

Press <kbd>↵</kbd> to copy the corrected text, or <kbd>⌘</kbd><kbd>K</kbd> → **Paste Corrected Text**. Press <kbd>⌘</kbd><kbd>D</kbd> to switch between the changes and the clean text.

If nothing is selected, Proofreader checks the clipboard text instead and marks the result with **📋 From clipboard**.

## Quick Fix

Select text in any app and run **Quick Fix**. Proofreader replaces the selection with the corrected text, without opening a window, and reports `✏️ Fixed 2 mistakes` or `✅ No mistakes found`. If the model takes longer than a second (for example while it loads), `Fixing…` is shown.

Quick Fix only works on selected text; it does not fall back to the clipboard. It is meant to run from a hotkey.

Quick Fix does not paste an answer that does not look like a correction: when the model replaces most of your words (a rewrite, or an answer to a question in the text) or adds a preamble such as "Here is the corrected text:", Quick Fix opens **Fix Spelling and Grammar** with the result instead. Your selection stays, so <kbd>⌘</kbd><kbd>K</kbd> → **Paste Corrected Text** still replaces it.

Fix Spelling and Grammar and Quick Fix do not add a period after the last sentence if your text has none. To get standard punctuation, clear **Do not add a period at the end** in Raycast Settings → Extensions → Proofreader.

## Rewrite in Simplified Technical English

Select text and run **Rewrite in Simplified Technical English**. Proofreader rewrites it in [ASD-STE100 Simplified Technical English](https://www.asd-ste100.org) (STE) and shows the rewritten text, with the same clipboard fallback and actions as **Fix Spelling and Grammar**. Press <kbd>⌘</kbd><kbd>D</kbd> to see the changes.

The prompt asks for the core STE rules: simple tenses, no `-ing` forms, phrasal verbs or contractions, the active voice, one topic and at most 20 words (instructions) or 25 words (descriptions) per sentence, commands for instructions, no noun groups longer than 3 words, no semicolons, no "e.g.", "i.e." or "etc.", and simple words ("use", not "utilize"). It also keeps the tense, the cause and condition words, technical names and `code` from the original. Instructions and questions in the text, for example in a prompt for an AI, are rewritten, not followed or answered.

A local model does not know the STE dictionary of approved words, so the result is closer to STE, not certified STE. Small models also ignore some rules, most often the noun-group limit. Read the changes before you use the text.

## Requirements

- macOS on Apple Silicon
- [Raycast](https://raycast.com)
- [Ollama](https://ollama.com/download) (the app starts its server at login)
- Node.js 22.6 or newer

## Setup

1. Download a model (see [Choosing a model](#choosing-a-model)), for example:

   ```bash
   ollama pull gemma4:e4b-it-qat
   ```

2. Install the dependencies and add the extension to Raycast:

   ```bash
   npm install
   npm run dev
   ```

   When the commands show in Raycast, stop `npm run dev` with <kbd>⌃</kbd><kbd>C</kbd>. The extension stays in Raycast; run `npm run dev` again only when you change the code.

3. In Raycast, search for **Fix Spelling and Grammar**, **Quick Fix** or **Rewrite in Simplified Technical English**. The first time, Raycast asks for **Ollama Model**: enter the name of the model from step 1, as `ollama list` shows it.
4. Optionally, assign hotkeys in Raycast Settings → Extensions → Proofreader.

## Choosing a model

Proofreader has no default model: use any model you pulled with Ollama, and change it in Raycast Settings → Extensions → Proofreader → **Ollama Model**.

These models gave the best results in October 2026, with the prompts in this repository ([full results](bench/RESULTS.md)). Newer models will come; run the benchmark to compare them.

| Your RAM | Model | Memory when loaded | Fix Spelling and Grammar | Time per check |
|---|---|---|---|---|
| 32 GB or more | `qwen3.6:35b` | 23.7 GB | 34 of 34 test sentences, 9 of 9 tense errors | 0.3 s |
| 32 GB or more | `gemma4:26b` | 16.1 GB | 32 of 34, 8 of 9 | 0.3 s |
| 16 GB | `gemma4:e4b-it-qat` | 5.7 GB | 32 of 34, 9 of 9; weaker in Polish | 0.9 s |

Times are from a MacBook Pro with an M4 Pro and 48 GB; a 16 GB laptop is slower.

Ollama unloads a model after 5 minutes without use, so the first check after a break waits for it to load (about 2 s for `gemma4:e4b-it-qat`, 9 s for `qwen3.6:35b`). To keep it loaded longer, set `OLLAMA_KEEP_ALIVE` (for example `launchctl setenv OLLAMA_KEEP_ALIVE 30m`) and restart the Ollama app.

On a Mac, pull `gemma4:e4b-it-qat` (a 6.1 GB download), not `gemma4:e4b`: the default tag downloads a 9.5 GB variant that is too large for 16 GB.

## Troubleshooting

| Message or symptom | Fix |
|---|---|
| `Select some text first` (Quick Fix) | The app did not report a selection. Select the text again, or use **Fix Spelling and Grammar**, which also reads the clipboard. |
| `Start Ollama first` | Open the Ollama app. |
| `Model "…" is not installed` | Run `ollama pull <model>`, or set one of the installed models that the message lists: <kbd>⌘</kbd><kbd>K</kbd> → **Open Extension Settings**. |
| `The text is too long for the model` | Ollama stopped the answer at the end of the model's context. Select a shorter part, or raise `OLLAMA_CONTEXT_LENGTH`. |
| Quick Fix opens a window instead of pasting | The model's answer replaced most of the text or added a preamble. Check the changes, then paste them with <kbd>⌘</kbd><kbd>K</kbd>, or use a larger model. |
| A correct sentence is shown as changed | Small models over-correct. Use a larger model from the table. |
| The old icon still shows after changing it | Raycast caches icons by file name. Rename the icon file. |
| `npm install` fails with `ETARGET` | A security wrapper such as Aikido Safe-chain may hide very new package versions. Don't turn it off; use an older version of the package. |

## How it works

1. The command reads the selected text (the commands with a view fall back to the clipboard).
2. It sends the text to Ollama at `http://localhost:11434/api/generate` with the command's prompt (`src/prompts.ts`), `temperature: 0` and `think: false`. It does not set the context size or `keep_alive`, so your Ollama settings apply.
3. It compares the original and corrected text word by word (`src/diff-markdown.ts`). Changes in quote style (`'` vs `’`) are not counted as edits, and a period that the model added at the end is removed (`src/final-period.ts`).
4. Fix Spelling and Grammar and Rewrite in Simplified Technical English render the result in a Raycast `Detail` view; Quick Fix pastes the corrected text over the selection, keeping its leading and trailing whitespace.

The model only returns the corrected text; the highlighting is computed locally, so it is always accurate to what changed.

## Development

```bash
npm run dev     # run in Raycast with hot reload
npm run lint    # ESLint + Prettier
npm run build   # type-check and build
npm test        # unit tests
npm run bench -- qwen3.6:35b gemma4:e4b-it-qat       # score Fix Spelling and Grammar
npm run bench:ste -- qwen3.6:35b gemma4:e4b-it-qat   # print STE rewrites for review
```

`npm run bench` sends each sentence in `bench/cases.mjs` through the same request as the extension and prints a Markdown table; the raw answers go to `bench/results.json`. `npm run bench:ste` prints the STE rewrites of `bench/ste-cases.mjs` side by side, because STE has no single correct answer. `bench/RESULTS.md` has the latest results.
