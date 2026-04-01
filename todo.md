# Round 7 Todo

## Architecture Change
- [ ] Remove Setup Wizard mode entirely (no more Setup/Normal toggle)
- [ ] Setup Progress becomes the ONLY content on Team Lead page when setup incomplete
- [ ] Remove "What you'll get" preview cards from Team Lead page

## Setup Progress Steps
- [ ] Step 1: Connect Ticketing System → links to Settings > Ticketing System section
- [ ] Step 2: Import Policies → links to Playbook > Documents tab (NOT a wizard step)
- [ ] Step 3: Configure Agent → links to Settings > Configure Agent section
- [ ] Step 4: Send Rep to Work → only enabled when steps 1-3 complete; guides user to set Go Live status
- [ ] Each step shows completion status (done/pending/locked)

## Playbook Documents Tab
- [ ] Empty state with upload guidance (drag & drop, URL import)
- [ ] "Try with a sample document" option in empty state
- [ ] First successful extraction → Team Lead gets a message (like New Rule notification)

## Settings (replaces Setup Wizard)
- [ ] Ticketing System section: Zendesk sub-steps with progressive disclosure
- [ ] Configure Agent section: first time — Rep Name & Personality empty, button says "Hire Rep"
- [ ] On "Hire Rep" save → navigate to home (Team Lead view)
- [ ] No Skip/Continue buttons — just save/edit in place

## Home.tsx
- [ ] Remove Setup/Normal toggle
- [ ] Settings overlay only shows Ticketing System + Configure Agent
- [ ] Handle navigation from Setup Progress links

## PRD
- [ ] Write comprehensive Onboarding PRD covering all logic flows
