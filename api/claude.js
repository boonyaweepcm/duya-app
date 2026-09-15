// Vercel serverless function — keeps ANTHROPIC_API_KEY on the server, never sent to the browser.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "Missing ANTHROPIC_API_KEY environment variable on the server" });
    return;
  }

  try {
    const { system, messages, tools } = req.body || {};

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        system,
        messages,
        tools,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
