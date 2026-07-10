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

## Optional env

Copy `frontend/.env.example` to `frontend/.env` and fill values as needed.
