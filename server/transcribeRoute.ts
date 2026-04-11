import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";
import { sdk } from "./_core/sdk";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg", "audio/m4a", "audio/x-m4a"];
    cb(null, allowed.includes(file.mimetype) || file.mimetype.startsWith("audio/"));
  },
});

const transcribeRouter = Router();

transcribeRouter.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    // Auth check
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const file = req.file;
    if (!file) return res.status(400).json({ error: "No audio file provided" });

    // Upload to S3
    const key = `voice/${user.id}/${Date.now()}.webm`;
    const { url } = await storagePut(key, file.buffer, file.mimetype || "audio/webm");

    // Transcribe
    const result = await transcribeAudio({ audioUrl: url, language: "en", prompt: "Personal journal entry" });

    if ("error" in result) return res.status(500).json({ error: result.error });

    res.json({ text: result.text });
  } catch (err) {
    console.error("[transcribe]", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

export { transcribeRouter };
