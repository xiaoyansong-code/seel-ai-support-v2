# Round 5 Todo

## SetupSettings.tsx
- [ ] Remove Import Policies section from Settings mode (isWizard=false)
- [ ] Add Playbook hint in onboarding Import step
- [ ] Zendesk: vertical layout (3 sub-steps stacked, not tabs)
- [ ] Zendesk: unified "View Setup Guide" link above all sub-steps
- [ ] Zendesk: onboarding — step-by-step reveal, single Primary CTA per step, auto-advance
- [ ] Zendesk: settings — no step numbers, no Skip/Continue, sections with fold/unfold
- [ ] Zendesk Step 3: rename to "Verify Connection" — assign test ticket, verify receipt
- [ ] Action Permissions: Read (default all on, collapsible) + Read & Write (subcategories)
- [ ] Action Permissions: name + toggle only, description in hover tooltip
- [ ] Action Permissions: subcategory collapsible with "X of Y enabled" summary
- [ ] Escalation Handoff: flat vertical layout, no tabs
- [ ] Go-Live: both modes require Zendesk; "Save Configuration" when not connected
- [ ] Differentiate onboarding vs settings text/buttons

## AgentsPage.tsx
- [ ] Team Lead preview/expectation page when setup incomplete
- [ ] Show capabilities preview (Digest, Proposals, Insights) with sample data labeled as preview

## Home.tsx
- [ ] Settings: only Zendesk + Configure Agent (remove Import from settings)

## data.ts
- [ ] Add subcategory field to ActionPermission for grouping
