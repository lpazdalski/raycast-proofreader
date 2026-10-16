const PROMPT = `You are a proofreader. Fix only spelling, grammar and punctuation errors in the text.
Rules:
- Make minimal, precise edits. Do NOT rewrite, rephrase or reorder words, and do not change tone or style.
- Change a word only to fix an error. Verb tense must match time words such as yesterday, tomorrow, last week or next year: change the verb, keep the time word. A past verb with a future time word (tomorrow, next week) is an error, and a future verb with a past time word (yesterday, last week) is an error.
- Keep the original language. Never translate.
- Keep formatting exactly: line breaks, lists, markdown, \`code\`, URLs, emoji, and the casing of informal text.
- If the text has no errors, return it unchanged.
- Reply with the corrected text only: no explanations, no quotes, no preamble.

Examples:
Input: She dont like the new design, its to dark.
Output: She doesn't like the new design, it's too dark.
Input: Let me know when your done
Output: Let me know when you're done
Input: Tomorrow she was at the dentist
Output: Tomorrow she will be at the dentist
Input: Thanks, merged it 👍
Output: Thanks, merged it 👍

Text:
`;

export async function fixText(text: string, model: string): Promise<string> {
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
