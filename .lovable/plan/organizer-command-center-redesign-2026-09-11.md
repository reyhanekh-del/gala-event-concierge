# Organizer Command Center Redesign

## Goal
Rebuild the organizer dashboard as a finished, mobile-first event command center using the selected Onyx composition, adapted to the locked Porcelain & Ink palette and the app’s existing Gala branding.

## What will change
- Replace the current credit-summary dashboard with a calm editorial feed led by the organizer’s active event.
- Add a compact top bar with Gala branding, an interactive `84 Available` credit explanation, and a profile shortcut.
- Add a time-aware greeting and direct `+ New event` action.
- Add an interactive **Needs attention** tray for missing country codes and invitations nearing expiry; actions will visibly resolve or nudge the mock issues.
- Add the featured **Autumn Charity Gala** event view with event metadata, a 79% capacity meter, and Attending / In-flight / Staged pipeline counts.
- Add the staged-batch strip and connect **Review & Send batch (18)** to the existing preparation flow.
- Add a secondary event preview for **Private Architectural Preview**.
- Add a concise live activity timeline with acceptance, delivery-failure, and restored-credit entries.
- Replace the organizer dock with four focused destinations: **Events**, **Guests**, **Credits**, and **Settings**.

## Supporting updates
- Refine the shared mobile shell so the four-item dock remains stable, readable, and safe-area aware.
- Add organizer-specific semantic surface and status tokens to the global design system; preserve the rest of Gala’s visual system.
- Keep all data and interactions frontend-only using deterministic mock content and local component state.
- Add unique dashboard metadata for sharing and search previews.

## Interaction and quality checks
- Verify the credit explanation, attention actions, profile shortcut, event links, new-event action, and send-flow action.
- Check the dashboard at mobile size and inside the existing desktop phone frame.
- Confirm no clipped text, overlapping dock/content, runtime errors, or build errors.

## Technical details
- Main implementation: `src/routes/organizer.dashboard.tsx`.
- Shared dock update: `src/components/gala/MobileShell.tsx` and `src/components/gala/organizerTabs.ts`.
- Semantic styling: `src/styles.css` using Tailwind v4 tokens.
- Existing routes will be reused for event creation, guest staging, credit ledger, settings, profile/settings, and invitation preparation.
