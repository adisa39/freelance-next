# BF-Blessy freelance marketplace — Next.js + MongoDB

Port of the Laravel 11 freelancing platform (`core_6.rar`) to **Next.js (App Router, TypeScript) + MongoDB (Mongoose)**.
Three roles, as in the original: **freelancer** (Laravel `user`), **client** (`buyer`), **admin**.

## Run it
```bash
cp .env.example .env        # set MONGODB_URI and AUTH_SECRET (>=32 chars)
npm install
npm run seed                # admin / ChangeMe123! (override with ADMIN_PASSWORD), demo categories, skills, fee tiers, payment methods
npm run dev                 # http://localhost:3000   admin: /admin/login
```

## UI = the original template (bf-blessy.com)
The public site and dashboards use the **original Olance template assets unchanged** (`public/assets/` = Bootstrap, `main.css`,
`custom.css`, `main.js`, slick/select2/odometer, line-awesome/fontawesome, all images) and markup ported 1:1 from the Blade views
(same class names), so it renders like the Laravel site:
- `src/app/(site)/(public)` header/footer pages: `/`, `/about`, `/contact`, `/blogs`, `/blog/[slug]`, `/freelance-jobs`,
  `/explore-job/[slug]`, `/talents`, `/talent/details/[username]`, `/policy/[slug]`, `/cookie-policy`
- `src/app/(site)/(auth)`: `/freelancer|buyer/login|register` (split-screen account layout)
- `src/app/(site)/(dash)`: `/freelancer/*`, `/buyer/*` inside the template's sidebar/header dashboard shell
- `src/app/(admin)`: admin panel (own Tailwind layout; not restyled)
- CMS content (home sections, FAQ, policies, contact, social icons…) comes from the `frontends` collection, seeded from
  `src/data/cms.json` (extracted from the original `database.sql`, with the BF-Blessy name/contact overrides seen on the live site).
  If the collection is empty the bundled JSON is used. Theme colours come from `settings.baseColor` (default `14a800` — change it
  in `src/data/cms.json` if your live DB differs; it is the Laravel `color.php` port in `lib/template.ts`).
- Site links are plain `<a>` (full page loads) on purpose: the template's jQuery plugins initialise once per page, like Laravel.
- Per-page `<style>` blocks from Blade were extracted to `public/assets/templates/basic/css/pages/*.css`.

## What was ported
| Laravel | Here |
|---|---|
| `Constants/Status.php` | `src/lib/constants.ts` (same numeric values) |
| Models + pivots (`skill_user`, `job_skills`, `educations`, `portfolios`) | `src/models/*` — pivots become ObjectId arrays, educations/portfolios are embedded in `User` |
| `JobExploreController` | `GET /api/jobs`, `/api/jobs/[slug]` (+ `/jobs` pages) |
| `Buyer\ManageJobController` (post/edit/bids/shortlist/**hireTalent**) | `/api/buyer/jobs*`, `/api/buyer/bids*`, `lib/services/marketplace.ts#hireTalent` |
| `User\BidController`, `User\ProjectController` | `/api/freelancer/bids*`, `/api/freelancer/projects*` |
| `Buyer\ProjectController@complete/report/updateReviewRating` | `completeProject()` service + `/api/buyer/projects/[id]/*` |
| Admin `rejectProject` / `completeProject` for reported projects | `/api/admin/projects/[id]` |
| Deposits / Withdrawals (+ admin approve/reject, refund on reject) | `lib/services/finance.ts`, `/api/wallet/*`, `/api/admin/{deposits,withdrawals}` |
| Conversations / messages / attachments | `/api/conversations*` (4s polling instead of Pusher) |
| Support tickets, notifications, settings, categories, skills, charges, badges | `/api/tickets`, `/api/notifications`, `/api/admin/*`, `lib/resources.ts` |

Business rules kept: escrow hold on hire, service-charge tiers + fixed fee, badge by lifetime earnings, one bid per job, only
unapproved jobs editable, bidding gated on a complete profile, reported-project resolution, withdrawal refund on rejection.

## Behavioural differences (deliberate)
- **Money safety:** balance changes use atomic `$inc` with a `balance >= amount` guard; hiring locks the job with a status
  compare-and-set; project completion is an atomic status claim (can't be paid twice). Mongo multi-document transactions
  are not required, so this runs on a standalone `mongod`.
- Withdrawals are one step (Laravel had preview + submit); the balance is debited immediately and refunded if admin rejects.
- Auth is a signed JWT in an httpOnly cookie (Laravel session guards). Route handlers check role; pages check in layouts.
- Uploads go to `UPLOAD_DIR` (outside `public/`) and are served only through authorised endpoints.
- Amounts are JS numbers rounded to 2 decimals (Laravel used `decimal(28,8)`). Switch to integer minor units if you need
  sub-cent precision.

## Known gaps vs the live site
- **Dashboards:** the shell (sidebar/header), widgets, cards, tables, buttons, form controls and badges use the template classes, but
  inner dashboard pages are my own simplified screens, not 1:1 ports of every `user/*` and `buyer/*` Blade view (profile wizard
  tabs, KYC, 2FA, password pages, job-post wizard layout, invoice views are not replicated).
- **Admin panel** is not the original admin theme.
- Static uploads from the old site (profile photos, badges, portfolio images, blog images) are not in the archives; copy them to
  `UPLOAD_DIR/{profile,portfolio,badge}` (served at `/api/uploads/...`) and `public/assets/images/frontend/blog`.
- Not verified in a real browser here (no browser in the build sandbox): pages were built and fetched over HTTP and every referenced
  asset checked to exist, but pixel-level comparison with bf-blessy.com is still needed.

## NOT ported (needs decisions / credentials)
- **30+ payment gateways** (Stripe, PayPal, Razorpay, crypto…): only *manual* deposits are implemented. Add a gateway by creating
  a Deposit with status `INITIATE`, redirecting to the provider, then calling `approveDeposit()` from a verified webhook
  (it is idempotent).
- **Email/SMS/push templates** (`notify()` fan-out), social login, 2FA, KYC, email/mobile verification codes, password reset,
  CMS page builder / frontend sections, multi-language, extensions, system update/log tools, subscribers.
- **Data migration:** `install/database.sql` only contains the installer seed (CMS content, settings), which is imported. Your live
  users/jobs/bids/projects need a separate export from the production MySQL → Mongo (`id → _id`, FK → ObjectId).
- Tests were not written, and the app has been type-checked and production-built but **not run against a live MongoDB**.
