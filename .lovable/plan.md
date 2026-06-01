
# Gala — Clickable MVP Prototype Plan

A frontend-only, high-fidelity prototype covering the full Gala journey: venue creates event → organizer claims & invites → invitee RSVPs → QR check-in → analytics. All data is mocked in-memory; no backend.

## 1. Foundation

- **Stack**: existing TanStack Start + Tailwind v4 + shadcn/ui. No backend, no Lovable Cloud.
- **Design tokens** (`src/styles.css`): pure black/white/gray palette in oklch, generous spacing scale, soft shadows, 0.75rem radius, dark mode mirrored. Typography: Inter (UI) + a tasteful display serif (e.g. "Instrument Serif") for the "Gala" wordmark to feel luxury.
- **Logo**: text wordmark `Gala` (serif) + `G` monogram in a rounded square (SVG component, no image).
- **i18n + RTL**:
  - Lightweight context (`LocaleProvider`) with `en` / `ar` JSON dictionaries in `src/i18n/`.
  - Toggles `dir="rtl"` on `<html>` and flips layout via Tailwind logical properties (`ms-*`, `me-*`, `text-start`).
  - Language switcher in every app shell.
- **Mock data layer**: `src/mock/` exposes typed stores (events, guests, credits, venues, organizers, transactions, notifications, audit logs). A tiny `mockApi.ts` wraps them with `await delay()` to feel real. State persisted to `localStorage` so demo actions stick across reloads, with a "Reset demo data" action in Settings.
- **Shared UI kit**: `AppShell`, `StatCard`, `SectionHeader`, `EmptyState`, `QRCodePreview` (SVG generator, no library), `PhoneFrame` (wraps mobile app routes for desktop preview), `ChartCard` (recharts).

## 2. Routing (TanStack file-based)

Top-level entry at `/` is a **launcher** page letting the user jump into any of the 5 apps (and pick role/locale). Each app has its own layout route.

```text
/                                  Launcher (pick app + role)
/organizer/*                       Organizer Mobile App (rendered in PhoneFrame on desktop)
  splash, login, login/verify, profile-setup,
  dashboard, events, events/$id, events/new,
  credits/buy, credits/ledger,
  invite, invite/single, invite/group, invite/contacts, invite/manual, invite/history,
  rsvp, notifications, transactions,
  delegation, delegation/allocate, settings
/invite/$inviteId                  Invitee Web Experience
  index (details), confirm, group-select, qr, wallet
/venue/*                           Venue Portal
  dashboard, credits, credits/buy, events, events/new, events/$id,
  events/$id/claim-link, events/$id/scanner-pin,
  analytics, revenue
/scanner/*                         Scanner
  login (PIN), scan, result/$state
/admin/*                           Gala Admin Portal
  dashboard, venues, venues/$id, organizers, organizers/$id,
  packages, notifications, revenue, audit, support
```

A persistent **role/app switcher bar** (dismissible) lets reviewers jump between apps without going back to `/`.

## 3. Applications

### A) Organizer Mobile App
- Rendered inside a phone frame on tablet/desktop, edge-to-edge on mobile.
- Splash → OTP login → OTP verify (any 4 digits accept) → profile setup → dashboard.
- **Dashboard**: greeting, upcoming events carousel, credit summary (Total/Available/Reserved/Consumed) as 4 stat tiles, RSVP summary donut, recent activity feed, quick actions grid.
- **Events list / details** with tabs Overview · Guests · Credits · Analytics · Delegates. Guests tab has filter chips (Accepted/Pending/Rejected/Expired/Checked-in).
- **Create Event** wizard (3 steps: basics, venue & timing, branding/cover).
- **Invite flows**: Single (name, phone, language, WhatsApp preview modal), Group (primary + additional guests, live credit cost), Contact Picker (mock contact list), Manual entry, Invite History.
- **Credits**: Buy Credits (package cards, mock checkout success), Ledger (running balance table).
- **Delegation**: list of co-inviters, add co-inviter, allocate credits slider, per-delegate usage bars.
- **Notifications**, **Transactions**, **Settings** (language toggle, theme, reset demo).

### B) Invitee Web Experience
- Public, share-shaped URL `/invite/:id`.
- Hero with event cover, venue, date/time, map (static styled map image placeholder), host name.
- CTA row: **Accept**, **Reject**; group invites show **Select Attendees** sheet then **Confirm All**.
- On accept → generated QR card page with attendee name, event, seat/section (mock), Add to Wallet page with Apple/Google wallet-style pass mock.
- States: pending, accepted, rejected, expired, checked-in (each renders distinct page).

### C) Venue Portal (desktop-first, responsive)
- Sidebar nav (Dashboard, Credits, Events, Analytics, Revenue, Settings).
- Dashboard widgets: Total Credits Purchased, Allocated, Active Events, Upcoming, Show Rate %, Revenue, plus charts.
- Credits: balance, allocation by event table, **Buy Credits** flow.
- Events: list + create + detail (tabs Overview · Credits · Organizers · Analytics). Detail includes **Generate Claim Link** (copyable URL + QR), **Generate Scanner PIN** (6-digit, copy/regenerate).
- Analytics & Revenue Reports: charts described below.

### D) Scanner Page (mobile-first)
- PIN login (4–6 digits, validates against mocked event PINs).
- Scanner screen: live camera placeholder with animated reticle + "Scan demo QR" button that opens a list of sample QR payloads from mock guests.
- Result screens for each state: Valid Check-In (green check, guest name), Already Checked-In, Invalid QR, Cancelled Guest, Wrong Event. Each has "Scan next" button.

### E) Gala Admin Portal
- Sidebar nav. Pages: Dashboard, Venues, Organizers, Credit Packages (CRUD on mock list), Notifications (broadcast composer), Revenue Reporting, Audit Logs (filterable table), Support Tools (search user → actions: Resend Invite, Adjust Credits, Cancel Invite, View Activity timeline).

## 4. Analytics (recharts, mock data)
- **RSVP Funnel**: horizontal funnel Invited → Accepted → Checked-In.
- **Attendance**: grouped bar Expected vs Arrived per event.
- **Revenue**: monthly line/area of credit sales.
- **Response Time**: histogram of hours from invite sent → RSVP.
Reused on Organizer Event Analytics, Venue Analytics/Revenue, Admin Revenue.

## 5. Mock Data Highlights
- 2 venues (e.g. "Ritz Riyadh", "Address Dubai Marina"), 4 organizers, ~6 events spanning upcoming/past, ~120 guests with varied statuses, 3 co-inviters, credit packages (500/2k/10k), transaction history, notifications, audit log entries. All seeded deterministically in `src/mock/seed.ts`.

## 6. Out of Scope
- Real auth, payments, SMS/WhatsApp, real QR scanning, real maps, server functions, database. Everything is simulated client-side.

## Technical Notes
- All new code under `src/` with route files in `src/routes/` matching TanStack flat-dot naming; root layout untouched beyond wiring `LocaleProvider` and theme.
- QR codes drawn as deterministic SVG modules from a hash of the invite id (no external lib needed; can add `qrcode` if scanability matters — confirm if you want truly scannable codes).
- Charts via `recharts` (add dependency).
- Estimated ~70–90 new files. Will be built in batches: foundation/i18n/mock → shared UI → Organizer app → Invitee → Venue → Scanner → Admin → polish pass.

## Open Questions
1. Should QR codes be **truly scannable** (use `qrcode` lib) or stylized SVG only?
2. Any **brand font** preference, or proceed with Instrument Serif (display) + Inter (UI)?
3. Default landing on `/` — keep the **app launcher**, or auto-route into the Organizer app and rely on the floating switcher?
