# Proofreader

A Raycast command that fixes spelling and grammar with a local AI model running in [Ollama](https://ollama.com). It is a free, private alternative to Raycast AI's "Fix Spelling and Grammar": your text never leaves your Mac.

Select text in any app, run **Fix Spelling and Grammar**, and Proofreader shows only what changed:

- removed words are ~~struck through~~
- new or corrected words are green
- a **Changes** panel lists each edit, e.g. `has alot → have a lot`

Press <kbd>↵</kbd> to copy the corrected text, or <kbd>⌘</kbd><kbd>K</kbd> → **Paste Corrected Text**.

If nothing is selected, Proofreader checks the clipboard text instead and marks the result with **📋 From clipboard**.

## Requirements

- macOS on Apple Silicon
- [Raycast](https://raycast.com)
- [Ollama](https://ollama.com/download) (the app starts its server at login)
- Node.js 22 or newer

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

3. In Raycast, search for **Fix Spelling and Grammar**. Assign a hotkey in Raycast Settings → Extensions → Proofreader.

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
| `Start Ollama first` | Open the Ollama app. |
| `Ollama error 404: model '…' not found` | Run `ollama pull <model>`, or fix the model name in the extension preferences. |
| A correct sentence is shown as changed | Small models over-correct. Use a larger model from the table. |
| The old icon still shows after changing it | Raycast caches icons by file name. Rename the icon file. |
| `npm install` fails with `ETARGET` | A security wrapper such as Aikido Safe-chain may hide very new package versions. Don't turn it off; use an older version of the package. |

## How it works

1. The command reads the selected text (or the clipboard).
2. It sends the text to Ollama at `http://localhost:11434/api/generate` with a minimal-edit prompt, `temperature: 0` and `think: false`.
3. It compares the original and corrected text word by word (`src/diff-markdown.ts`) and renders the differences in a Raycast `Detail` view. Changes in quote style (`'` vs `’`) are not counted as edits.

The model only returns the corrected text; the highlighting is computed locally, so it is always accurate to what changed.

## Development

```bash
npm run dev     # run in Raycast with hot reload
npm run lint    # ESLint + Prettier
npm run build   # type-check and build
```
