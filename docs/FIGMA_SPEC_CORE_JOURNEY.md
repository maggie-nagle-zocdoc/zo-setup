# Zo Setup — Core Journey Spec for Figma (PM/Design)

Use this spec to create or refine frames in your Figma file for stakeholder feedback and design handoff.

**Figma file:** [Zo set-up — Q4 2025](https://www.figma.com/design/1Rxf9ZEJHZHdsSfvrV9yu7/Zo-set-up---Q4-2025?node-id=190-273)

**App routes (base):** `/projects/zo-setup` (or `/zo-setup/projects/zo-setup` with basePath).

---

## 1. Journey order (main pages)

| # | Page name | Route | Notes |
|---|-----------|--------|------|
| 0 | Project landing | `/projects/zo-setup` | Table of all sections/pages; entry to flow |
| 1 | Welcome to Zo | `/projects/zo-setup/intro` | “What to expect” — 3 bullets: phone lines, scheduling, voice |
| 2 | Practice information | `/projects/zo-setup/section-1-task-1` | Pronunciation + optional extra practice names (see Section 2) |
| 3 | Phone lines | `/projects/zo-setup/section-1-task-2` | Choice → loading → result; 3 paths (see Section 3) |
| 4 | Transfer numbers | `/projects/zo-setup/section-1-task-3` | Catch-all per line + optional additional transfers; gated until at least one phone line |
| 5 | Exclusions | `/projects/zo-setup/section-2-task-1` | Exclude providers, visit reasons, locations from Zo scheduling |
| 6 | Scheduling options | `/projects/zo-setup/section-2-task-2` | Required info, when to transfer, SMS confirmations |
| 7 | Voice Task 1 | `/projects/zo-setup/section-3-task-1` | Voice configuration |
| 8 | Voice Task 2 | `/projects/zo-setup/section-3-task-2` | Voice configuration |
| 9 | Voice Task 3 | `/projects/zo-setup/section-3-task-3` | Voice configuration |

---

## 2. Practice information — paths to include

**Single practice name (default)**  
- Listen to pronunciation (e.g. “Soho Medical”).  
- **Path A:** “Sounds good” (no phonetic).  
- **Path B:** “I need to update the pronunciation” → show **Phonetic spelling** field.

**Optional practice names**  
- **Path C:** User taps “Add another practice name” → one or more additional rows.  
- Each row: **Practice name** (required when row exists), optional **Phonetic spelling** (with “I need to update the pronunciation” toggle).  
- These names are used later on **Phone lines** when user has multiple practice names (per-line dropdown).

**Suggested Figma frames**  
- `Practice info — Single name, sounds good`  
- `Practice info — Single name, update pronunciation`  
- `Practice info — With additional practice name (1 row)`  
- `Practice info — With additional practice names (2+ rows)`

---

## 3. Phone lines — every path

### 3.1 Choice (step 1)

One screen: “How does your practice receive calls?” with three options:

- **One number** — “I have one phone number that directs all of my calls”  
- **Per location** — “I have unique phone numbers for every location”  
- **Regional** — “I have multiple regional phone numbers”

**Suggested frame:** `Phone lines — Choose how practice receives calls`

### 3.2 Loading

Short loading state (~2.2s) after selection before result.

**Suggested frame:** `Phone lines — Loading`

### 3.3 Result (step 2) — by choice

**Path: One number**  
- One Zo phone line created; name editable (default “Main line”); all locations assigned; working hours editable (drawer).  
- **Practice name:** dropdown only if user added multiple practice names in Practice information.

**Suggested frame:** `Phone lines — Result (one line)`  
**Variant:** `Phone lines — Result (one line) — with practice name dropdown`

**Path: Per location**  
- One line per location; names/locations fixed; working hours editable per line (drawer).  
- **Practice name:** dropdown per line only when multiple practice names exist.

**Suggested frame:** `Phone lines — Result (per location)`  
**Variant:** `Phone lines — Result (per location) — with practice name dropdown`

**Path: Regional**  
- User creates lines: “Add another phone line”, name + location assignment + working hours per line.  
- **Practice name:** dropdown per line when multiple practice names exist (required when shown).  
- Each line: name, locations (search/add), optional practice name, working hours (drawer).

**Suggested frame:** `Phone lines — Result (regional) — single line`  
**Suggested frame:** `Phone lines — Result (regional) — multiple lines`  
**Variant:** `Phone lines — Result (regional) — with practice name dropdown`

### 3.4 Working hours (drawer)

Shared across all phone-line result types: right-side drawer “Phone line hours” — days (Su–Sa), time range per selected day, note that Zo always answers and hours are when staff can accept transfers.

**Suggested frame:** `Phone lines — Working hours drawer`

---

## 4. Transfer numbers

- One block per phone line: **Catch-all** (required) + optional **Additional transfer numbers** (table: type, number, applies to lines; add via drawer).  
- Transfer numbers step is disabled in nav until at least one phone line exists.

**Suggested frames**  
- `Transfer numbers — One line`  
- `Transfer numbers — Multiple lines`  
- `Transfer numbers — Add transfer drawer`

---

## 5. Scheduling & voice

- **Exclusions:** Providers, visit reasons, locations — exclude from Zo scheduling (drawers/lists per type).  
- **Scheduling options:** Required info (insurance, plan, member ID), when to transfer (self-pay, switch provider), SMS confirmations.  
- **Voice Task 1 / 2 / 3:** Placeholder voice configuration screens.

**Suggested frames**  
- `Exclusions — Overview`  
- `Exclusions — [Provider | Visit reason | Location] drawer/list`  
- `Scheduling options`  
- `Voice — Task 1` / `Task 2` / `Task 3`

---

## 6. Figma frame checklist (PM/Design)

Use this list to create or verify frames in [your Figma file](https://www.figma.com/design/1Rxf9ZEJHZHdsSfvrV9yu7/Zo-set-up---Q4-2025?node-id=190-273).

**Global**  
- [ ] Shell: header (logo, Reset, Save and exit), section nav, footer (Back / Skip for now / Continue or Get started / Finish)

**Core pages**  
- [ ] Project landing  
- [ ] Welcome to Zo (intro)  
- [ ] Practice info — single name (sounds good)  
- [ ] Practice info — single name (update pronunciation)  
- [ ] Practice info — with additional practice name(s)  
- [ ] Phone lines — choice  
- [ ] Phone lines — loading  
- [ ] Phone lines — result (one line)  
- [ ] Phone lines — result (per location)  
- [ ] Phone lines — result (regional, 1 line)  
- [ ] Phone lines — result (regional, multiple lines)  
- [ ] Phone lines — result variants with practice name dropdown (one / per location / regional)  
- [ ] Phone lines — working hours drawer  
- [ ] Transfer numbers — one line  
- [ ] Transfer numbers — multiple lines  
- [ ] Transfer numbers — add transfer drawer  
- [ ] Exclusions  
- [ ] Scheduling options  
- [ ] Voice Task 1, 2, 3  

**Notes for handoff**  
- Practice name dropdown on phone lines appears only when `additionalNames.length >= 1` from Practice information.  
- Section 1 Task 3 (Transfer numbers) is disabled until at least one phone line exists.  
- Catch-all is required per line before continuing from Transfer numbers.
