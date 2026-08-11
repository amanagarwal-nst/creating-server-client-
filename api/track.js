import { Redis } from "@upstash/redis";
import crypto from "crypto";

// Works with env vars injected by the Vercel Marketplace Upstash integration.
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const result = body.result === "correct" ? "correct" : "wrong";
    const id = String(body.id || "").slice(0, 64) || "anon";
    const nick = String(body.nick || "").slice(0, 40);

    // Coarse, privacy-preserving IP signal: hashed, never stored raw.
    const ipRaw = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const ipHash = ipRaw ? crypto.createHash("sha256").update(ipRaw).digest("hex").slice(0, 12) : "";

    // Count every attempt.
    await redis.incr(`attempts:${result}`);

    // Count unique browsers: store the latest result per browser id.
    // (last-write-wins so a student's final answer is what's tallied)
    await redis.hset("students", { [id]: JSON.stringify({ result, nick, ipHash, t: Date.now() }) });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "track failed" });
  }
}
