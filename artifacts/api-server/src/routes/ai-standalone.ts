import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ensureCompatibleFormat, speechToText } from "@workspace/integrations-openai-ai-server/audio";

const router: IRouter = Router();

router.post("/openai/chat/stream", async (req, res) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 4096,
      messages: messages as any,
      stream: true,
    });

    for await (const chunk of stream) {
      const c = chunk.choices[0]?.delta?.content;
      if (c) res.write(`data: ${JSON.stringify({ content: c })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat stream error:", err);
    res.write(`data: ${JSON.stringify({ error: "AI unavailable" })}\n\n`);
    res.end();
  }
});

router.post("/openai/transcribe", async (req, res) => {
  const { audio } = req.body as { audio: string };
  if (!audio) {
    res.status(400).json({ error: "audio required" });
    return;
  }

  try {
    const rawBuffer = Buffer.from(audio, "base64");
    const { buffer, format } = await ensureCompatibleFormat(rawBuffer);
    const text = await speechToText(buffer, format);
    res.json({ text });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

router.post("/openai/tts", async (req, res) => {
  const { text, voice = "alloy" } = req.body as { text: string; voice?: string };
  if (!text) {
    res.status(400).json({ error: "text required" });
    return;
  }

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as any,
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "TTS failed" });
  }
});

export default router;
