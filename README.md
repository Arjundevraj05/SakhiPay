# SakhiPay

Women-focused fintech demo: budgeting (Appwrite), UPI simulation, EMI manager, schemes & education.

## Run locally

```bash
cd frontend
npm install

# One command — API (4000) + React app (3000)
npm run dev

# Or run separately in two terminals:
# npm run server   # API on :4000
# npm start        # React on :3000
```

Open http://localhost:3000

## Flows that work out of the box

- **Landing / Sign up / Sign in** — Appwrite Cloud auth
- **Dashboard, Education, Schemes** — static/content pages
- **Budgeting** — expenses sync to Appwrite when collection permissions allow it; otherwise they are stored in the browser (localStorage) so the flow still works. Receipt upload uses S3 if configured, otherwise local preview. Analyze uses FinBERT if `HUGGINGFACE_API_KEY` is set, otherwise a local heuristic
- **UPI Simulation** — client-side PIN `1234`; email notifications are simulated in the API console unless Gmail/SES is configured
- **EMI Manager** — localStorage-backed EMI calculator

### Fixing Appwrite expense permissions (optional)

In the Appwrite console, open the expenses collection and allow **create/read/update/delete** for role **Users** (and/or **Any**). Until then, budgeting automatically falls back to local storage.

## Deploy to Vercel

The React app and API deploy together from the `frontend` folder.

### 1. Push to GitHub

Commit your changes and push the repo to GitHub (or GitLab/Bitbucket).

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
2. Set **Root Directory** to `frontend`.
3. Vercel should detect **Create React App** automatically (`build` → `build/`).
4. Deploy.

### 3. Environment variables (optional)

In Vercel → Project → Settings → Environment Variables, add any of:

| Variable | Purpose |
|----------|---------|
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Real UPI notification emails |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | SES email or S3 receipt uploads |
| `AWS_S3_BUCKET` | Receipt uploads |
| `HUGGINGFACE_API_KEY` | FinBERT expense analysis |

Without these, the app still works: emails are simulated, receipts use local preview, and expense analysis uses a local heuristic.

### 4. Appwrite (required for auth)

In the [Appwrite console](https://cloud.appwrite.io), open your project → **Auth** → **Settings** (or **Platforms**):

- Add your Vercel URL as a web platform, e.g. `https://your-app.vercel.app`
- Add `https://your-app.vercel.app` to allowed callback/origin URLs if prompted

### 5. Verify API

After deploy, open `https://your-app.vercel.app/api/health` — you should see `{"ok":true,...}`.

### CLI deploy (alternative)

```bash
cd frontend
npx vercel
```

Follow the prompts. Use `npx vercel --prod` for production.

## Optional env

Copy `frontend/.env.example` to `frontend/.env` and fill values as needed.
