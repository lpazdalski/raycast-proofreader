export async function rewrite(prompt: string, text: string, model: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: prompt + text, stream: false, think: false, options: { temperature: 0 } }),
    });
  } catch {
    throw new Error("Start Ollama first. It is not running on localhost:11434.");
  }
  const data = (await res.json().catch(() => ({}))) as { response?: string; error?: string };
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${data.error ?? res.statusText}`);
  return (data.response ?? "").trim();
}
