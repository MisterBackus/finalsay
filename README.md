# finalsay.lol — deploy from your phone

Everything below works in a phone browser. Budget about an hour.

## 1. Database (Turso) — 3 minutes
1. Go to turso.tech, sign up (GitHub login is easiest).
2. Create a database. Name it `finalsay`. Any region near you.
3. On the database page copy the **URL** (starts with `libsql://`).
4. Tap **Generate token**, copy it. Keep both in your Notes app.

## 2. Stripe — 5 minutes
1. stripe.com → sign up → activate your account (bank details) so payouts work.
2. Developers → API keys → copy the **Secret key** (`sk_live_...`).
3. Come back for the webhook secret after step 4.

## 3. Put the code on GitHub — 5 minutes
1. Unzip this on your phone (Android Files app can do it).
2. github.com → **New repository** → name it `finalsay` → Create.
3. On the empty repo page tap **uploading an existing file** and upload every file and folder. Commit.
   (If folders won't upload, install the GitHub app and use "Add file" there, or upload from a laptop later.)

## 4. Deploy on Vercel — 10 minutes
1. vercel.com → sign in with GitHub → **Add New → Project** → pick `finalsay` → Import.
2. Before deploying, open **Environment Variables** and add:
   - `STRIPE_SECRET_KEY` = your sk_live key
   - `TURSO_DATABASE_URL` = your libsql URL
   - `TURSO_AUTH_TOKEN` = your Turso token
   - `SITE_URL` = `https://finalsay.lol`
   - `ADMIN_KEY` = a long random string only you know
   - `STRIPE_WEBHOOK_SECRET` = leave as `placeholder` for now
3. Tap **Deploy**. Wait ~2 min. Note the `something.vercel.app` URL.

## 5. Connect the domain — 5 minutes
1. Vercel → project → Settings → Domains → add `finalsay.lol`.
2. Vercel shows you DNS records. At your registrar, set the A record and the www CNAME as shown.
3. Usually live within 10 minutes.

## 6. Stripe webhook — 5 minutes (the site does not work without this)
1. Stripe → Developers → Webhooks → **Add endpoint**.
2. URL: `https://finalsay.lol/api/webhook`
3. Events: select `checkout.session.completed` only.
4. After saving, reveal the **Signing secret** (`whsec_...`).
5. Vercel → Settings → Environment Variables → edit `STRIPE_WEBHOOK_SECRET` to that value.
6. Vercel → Deployments → ⋯ on the latest → **Redeploy**.

## 7. Test before going live (recommended)
Do steps 2, 4 and 6 with Stripe **test mode** keys first (toggle top-right in Stripe; keys start with `sk_test_` and `whsec_` from a test-mode webhook). Buy a sentence with card `4242 4242 4242 4242`, any future date, any CVC. When it shows up within a few seconds, swap all three Stripe values to live mode, redeploy, and buy the real first sentence yourself for $5.

## Optional: email people when they get erased (5 min, recommended)
1. resend.com → sign up → API Keys → create one.
2. Add `RESEND_API_KEY` in Vercel. Until you verify your domain in Resend, leave `EMAIL_FROM` blank and it sends from Resend's test address (only to your own email). To email real customers, add `finalsay.lol` under Resend → Domains, add the DNS records it gives you, then set `EMAIL_FROM` to `finalsay <hello@finalsay.lol>`.
Stripe already collects the buyer's email at checkout; that's what gets used.

## Optional: auto-tweet every replacement (15 min, biggest growth lever)
1. Make a fresh X account for the site (e.g. @finalsaylol).
2. developer.x.com → sign up for the free tier → create a Project and App.
3. App settings → User authentication settings → set up → App permissions **Read and write** → type: Web App → callback and website URL can both be `https://finalsay.lol` → save.
4. Keys and tokens → generate **API Key and Secret** and **Access Token and Secret** (regenerate access token after changing permissions or it stays read-only).
5. Add all four as `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` in Vercel → Redeploy.
Free tier allows ~1,500 posts/month which is plenty. Every paid replacement posts automatically.

## Removing something bad
Go to `https://finalsay.lol/admin?key=YOUR_ADMIN_KEY` and tap the button. The previous sentence comes back and the bad one shows as removed in the graveyard. Bookmark that URL on your phone.

## Tuning
- Prices: `lib/pricing.js`
- Blocked words: `lib/filter.js`
- Your X handle: bottom of `app/page.js`

## Launch
Post on X: screenshot of the page, the price, and "I built this on my phone from a campsite on Starlink." Reply with revenue screenshots every few hours. Tag people who tend to boost indie launches.
