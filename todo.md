# TODO - Round 3: Onboarding Redesign

## Architecture Changes
- [ ] Remove Onboarding/Normal toggle from top bar
- [ ] Onboarding Wizard: full-screen overlay on first visit, disappears after completion
- [ ] New Settings page: Integrations + Agent Config combined
- [ ] Settings entry: ⚙️ button at bottom of Agents tab
- [ ] Profile Sheet: read-only with "Edit in Settings →" link
- [ ] Persistent banner for skipped/incomplete items after setup

## Onboarding Wizard (left stepper + right content)
- [ ] Step 1: Connect Shopify (branch A: connected / branch B: not connected)
- [ ] Step 2: Connect Zendesk (3 sub-steps inline + skip + already done)
- [ ] Step 3: Upload SOP (upload/URL/sample/skip + parsing + conflict resolution)
- [ ] Step 4: Hire Rep (Name/Personality/Permissions form)
- [ ] Step 5: Choose Mode (Training/Production + Production confirm dialog)

## Settings Page
- [ ] Integrations section (Shopify + Zendesk status)
- [ ] Agent Config section (Identity + Permissions + Mode)

## State & Navigation
- [ ] Stepper: click to go back to any completed/skipped step
- [ ] Resume from where left off on re-entry
- [ ] TEST MODE: "Setup" shows Wizard, "Normal" shows agents
