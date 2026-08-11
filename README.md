# Instagram Request-Flow — deploy & track

An interactive drag-and-drop lesson. Students arrange Client / DNS / Server / Database
into the correct request flow. Right/wrong results are recorded and shown as a live bar chart.

## What's inside
- `index.html`     – the game + results chart (static, no build step)
- `api/track.js`   – records each attempt (correct/wrong)
- `api/stats.js`   – returns aggregate counts for the chart
- `package.json`   – one dependency: @upstash/redis

## Deploy to Vercel (about 5 minutes)

1. Put these files in a GitHub repo (or use the Vercel CLI — see below).
2. On https://vercel.com → "Add New… → Project" → import the repo.
   Framework preset: **Other**. No build command needed. Click Deploy.
3. Add the database:
   - In your Vercel project → **Storage** tab → **Create / Connect Database**
     → Marketplace → **Upstash (Redis)** → follow the prompts.
   - This automatically injects the env vars the code reads
     (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, aka `Redis.fromEnv()`).
4. **Redeploy** (Deployments → ⋯ → Redeploy) so the functions pick up the env vars.
5. Share the URL (e.g. `https://your-project.vercel.app`) with your students.

### CLI alternative
```
npm i -g vercel
cd instagram-flow
vercel            # first deploy (answer the prompts)
# add Upstash from the dashboard Storage tab, then:
vercel --prod
```

## About the tracking
- Each browser gets an anonymous random ID in localStorage. The "unique students"
  chart counts each browser's FINAL answer (retries don't inflate it).
- "Total attempts" counts every Check press.
- IPs are NOT stored raw — only a short SHA-256 hash, as a coarse signal.
  On school Wi-Fi the whole class usually shares one public IP, so IP is a poor
  way to tell students apart; the browser ID + optional name is far more reliable.

## Reset the counts between classes
In the Upstash console (opened from Vercel's Storage tab), run:
```
DEL attempts:correct attempts:wrong students
```
