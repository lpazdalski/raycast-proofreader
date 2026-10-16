const OLLAMA = "http://localhost:11434";

async function installedModels(): Promise<string[]> {
  const { models } = (await (await fetch(`${OLLAMA}/api/tags`)).json()) as { models: { name: string }[] };
  return models.map(({ name }) => name);
}

function modelNotInstalled(model: string, installed: string[]): Error {
  if (!installed.length) {
    return new Error(
      'Ollama has no models. Download one with "ollama pull <model>" and set it in the extension settings.',
    );
  }
  return new Error(
    `Model "${model}" is not installed. Installed models: ${installed.join(", ")}. ` +
      `Run "ollama pull ${model}" or change the model in the extension settings.`,
  );
}

export async function rewrite(prompt: string, text: string, model: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: prompt + text, stream: false, think: false, options: { temperature: 0 } }),
    });
  } catch {
    throw new Error("Start Ollama first. It is not running on localhost:11434.");
  }
  const data = (await res.json().catch(() => ({}))) as { response?: string; error?: string; done_reason?: string };
  if (res.status === 404) throw modelNotInstalled(model, await installedModels().catch(() => []));
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${data.error ?? res.statusText}`);
  if (data.done_reason === "length") throw new Error("The text is too long for the model. Select a shorter part.");
  return (data.response ?? "").trim();
}
