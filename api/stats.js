import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const [attemptsCorrect, attemptsWrong] = await Promise.all([
      redis.get("attempts:correct"),
      redis.get("attempts:wrong"),
    ]);

    // Unique browsers: read the hash and count each student's LATEST result.
    const students = await redis.hgetall("students"); // { id: {result, nick, ...} }
    let uCorrect = 0, uWrong = 0;
    if (students) {
      for (const v of Object.values(students)) {
        const rec = typeof v === "string" ? JSON.parse(v) : v;
        if (rec.result === "correct") uCorrect++; else uWrong++;
      }
    }

    return res.status(200).json({
      attempts: { correct: Number(attemptsCorrect) || 0, wrong: Number(attemptsWrong) || 0 },
      unique:   { correct: uCorrect, wrong: uWrong },
    });
  } catch (e) {
    return res.status(500).json({ error: "stats failed" });
  }
}
