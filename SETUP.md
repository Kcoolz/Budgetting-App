# Cloud Budget — Hosting & Sync Setup

One-time setup to get the app hosted free on GitHub Pages with private,
Google-sign-in-protected sync through Firebase. Total time: ~15 minutes.

**Zero-billing guarantee:** everything below uses Firebase's **Spark (free) plan
with no credit card attached**. If you never upgrade to the Blaze plan, Google
cannot charge you — exceeding a free quota just pauses the service until the
next day instead of billing. GitHub Pages has no billing at all. The free
Firestore quota (1 GiB storage, 50k reads/day, 20k writes/day) is thousands of
times more than a household budget will ever use.

---

## Part 1 — Firebase project (~8 min)

1. Go to <https://console.firebase.google.com> and sign in with your Google
   account. Click **Create a Firebase project**.
   - Name it anything (e.g. `cloud-budget`).
   - Disable Google Analytics when asked (not needed).
   - **Do not** add a billing account or upgrade the plan — stay on **Spark**.

2. **Enable Google sign-in:** open
   <https://console.firebase.google.com/project/budgetapp-c0b0a/authentication/providers>
   (or click **Authentication** in the left sidebar — newer consoles pin it
   under *Project shortcuts* instead of the old "Build" menu). Click
   **Get started** if prompted, then **Sign-in method → Google → Enable**.
   Pick a support email, save.

3. **Create the database:** open
   <https://console.firebase.google.com/project/budgetapp-c0b0a/firestore>
   (left sidebar: **Product categories → Databases & Storage → Firestore
   Database**) → **Create database**.
   - Choose a region close to you (e.g. `northamerica-northeast2` / Toronto —
     cannot be changed later).
   - Start in **production mode** (locked). The next step opens it to just
     the two of you.

4. **Publish the security rules:** open the **Rules** tab
   (<https://console.firebase.google.com/project/budgetapp-c0b0a/firestore/rules>),
   delete what's there, and paste the entire contents of
   [`firestore.rules`](firestore.rules) from this project. **Replace the two
   placeholder emails with your and your girlfriend's Google account emails
   (lowercase)**, then click **Publish**. The copy in this repo is just a
   template — only what's published in the console counts.

   > This allowlist is the lock on the door. Only those Google accounts can
   > read or write the budget — enforced by Google's servers, not by the app.
   > To invite or remove someone later, edit this list and Publish again.

5. **Register the web app:** click the gear icon → **Project settings** →
   **Your apps** → the `</>` (Web) icon.
   - Nickname: `cloud-budget` — do **not** tick "Firebase Hosting".
   - Copy the `firebaseConfig = { ... }` values it shows into
     [`src/lib/firebaseConfig.js`](src/lib/firebaseConfig.js) in this project.
   - These values are safe to commit — they're public identifiers, not secrets.

6. **Authorize your dev machine:** **Authentication → Settings → Authorized
   domains → Add domain**
   (<https://console.firebase.google.com/project/budgetapp-c0b0a/authentication/settings>)
   → add `127.0.0.1` (the dev server runs there; `localhost` is
   pre-authorized but `127.0.0.1` is not).

## Part 2 — GitHub Pages (~5 min)

GitHub Pages on a free account requires the repository to be **public**. That's
fine: the repo contains only app code, no budget data and no secrets.

1. Make the repo (<https://github.com/Kcoolz/Budgetting-App>) **public**:
   **Settings → General → Danger Zone → Change visibility → Public**. The
   repo contains only app code — the Firebase config values are public
   identifiers by design, and your budget data never touches the repo.

2. Enable Pages: **Settings → Pages → Build and deployment → Source** →
   select **GitHub Actions**. The included workflow
   (`.github/workflows/deploy-pages.yml`) builds and deploys on every push to
   `main`. First deploy takes ~2 minutes; the site will be at
   <https://kcoolz.github.io/Budgetting-App/>.

3. **Authorize the live site in Firebase:** back in **Authentication →
   Settings → Authorized domains → Add domain**
   (<https://console.firebase.google.com/project/budgetapp-c0b0a/authentication/settings>)
   → add `kcoolz.github.io`. Without this, Google sign-in is blocked on the
   live site.

## Part 3 — First sign-in (important: order matters)

The first allowlisted person to sign in **seeds the cloud** with whatever data
their device holds. After that, the cloud copy wins on every new device.

1. Open the site **on the device that has your existing budget data** and sign
   in with Google there first. Your data uploads automatically.
2. Then sign in on any other device / your girlfriend's devices — the budget
   appears within seconds and stays live-synced from then on.

(Safety net: before cloud data replaces anything, the app snapshots the
device's previous local data to the browser key
`cloud-budget-presync-backup-v1`, recoverable via DevTools → Local Storage.)

---

## How it works day-to-day

- Every change saves instantly on-device and syncs to Firestore about a second
  later — the cloud icon in the header shows Synced / Saving / Sync error.
- Edits made on one device appear live on the other.
- Offline is fine: changes queue locally (Firestore offline persistence) and
  upload when you're back online.
- Sign out from the profile menu (top right).

## Costs & limits recap

| Service | Plan | Hard limit before it stops (not bills) |
| --- | --- | --- |
| GitHub Pages | Free | 100 GB bandwidth/month, 1 GB site — no billing exists |
| Firebase Auth | Spark | 50k monthly active users |
| Firestore | Spark | 1 GiB stored, 50k reads / 20k writes per day |

A two-person budget uses well under 1% of each. **Never click "Upgrade" in the
Firebase console and no charge is possible.**
