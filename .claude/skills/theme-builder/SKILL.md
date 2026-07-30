---
name: theme-builder
description: Multi-agent brandstudio theme worker — a design-director agent researches and specs every component of a UK dealership site with adjacency contracts, then builder/verifier/fixer agents loop per component until specs pass on all screens, then an integrator wires the theme's content/color contracts. Trigger when Difatha wants a new theme built with the pro-designer pipeline ("/theme-builder", "build a theme with the agent pipeline"). For the single-threaded fallback use /new-theme.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, Agent, AskUserQuestion, WebFetch
---

# `/theme-builder` — multi-agent theme worker

You (the main thread) are the ORCHESTRATOR. You never design, build, or
verify yourself — you run intake, spawn the five agents below, enforce the
loop, manage infrastructure (brand rows, dev server), and run the final gate
suite. Keep your own context lean; the agents do the heavy reading.

| Agent (`subagent_type`) | Role |
|---|---|
| `theme-design-director` | researches, locks the concept, writes the design package; FIX mode turns verifier failures into build instructions |
| `theme-scaffolder` | scaffolds the theme + all whitelisted routes as bare contract-green pages |
| `theme-component-builder` | builds ONE component end-to-end per spec; applies fixes on re-entry |
| `theme-furnisher` | the conveyor belt — elevates a built component to rich, archetype-appropriate design (imagery/motion/neon-or-refined/canvas/micro-interactions) within the mobile + reduced-motion floors |
| `theme-verifier` | mechanical gates + furnishing judgement + desktop & real-device screenshots → structured verdict; never fixes |
| `theme-integrator` | assembles pages per section-flow contract, completes content/data contracts |

Shared formats: `.claude/skills/theme-builder/references/spec-format.md`
(design package, verdict/fix schemas) and `references/build-rules.md` (the
rules digest every agent reads). Canonical policy lives in
`.claude/skills/new-theme/SKILL.md` — reuse, never fork.

All run artefacts live in `tools/.theme-designs/<theme-id>/` (see
spec-format.md). `state.json` there is YOURS — update it after every stage
and component transition so a crashed run resumes instead of restarting.
On invocation, if `state.json` exists for the theme, RESUME from its stage.

`state.json` MUST carry a self-sufficient `digest` block: current stage,
per-component status + iteration count, escalations, infra slugs/base URLs/
shots dir, and any adjacency notes a later builder needs. Treat it as the
one thing that must survive a context reset — everything else can be
re-derived from disk.

### Context hygiene (compaction checkpoints)

A full run is long; the orchestrator's context WILL be auto-compacted by the
harness mid-run. That is safe ONLY if `digest` is current — so refresh it at
every checkpoint below, then let compaction happen (do not fight it):

- After each stage boundary (Design → Scaffold → Infra → each component pass
  → Integration → Gate suite).
- After every 2–3 component transitions inside Stage 4.

At a checkpoint: flush `digest`, then discard verbose intermediates from your
own working notes — agent return blobs, screenshot dumps, and full gate
output are all reproducible from disk and must NOT be carried forward. If
context is already heavy, you may `/compact` proactively; resume reads
`digest` and continues. A compaction subagent CANNOT do this for you — a
subagent has its own separate context and cannot shrink yours; keeping the
orchestrator lean is the orchestrator's own job, done via `digest` + disk.

## Invocation

```
/theme-builder                          # prompts for inputs
/theme-builder <theme-id>               # explicit id
/theme-builder --context "<hint>"       # business-mix hint (EV-only, bikes+cars, …)
```

Required inputs (same contract as /new-theme A1): logo file, dealer website
URL, ONE primary brand hex (never extracted from the logo). Optional context
hint. Ask once via AskUserQuestion if missing; then run autonomously.

## Stage 0 — Intake (main thread)

Follow `/new-theme` SKILL.md Phases 0–A6 **except A2e** (concept lock moves
to the design director): env check (`node tools/check-skill-env.mjs`), logo
vision notes (A2), archetype mapping (A2d), palette
(`node tools/check-palette-policy.mjs --primary <hex>` — block on failure),
site scrape (A3, biased by the context hint), font pairing (A4), DNA file
(A5 → `tools/.theme-dna/<slug>.json`), theme id (A6). Keep outputs on disk,
not in your context.

Then `TodoWrite` the full stage list and initialise `state.json`.

## Stage 1 — Design

Spawn `theme-design-director` (DESIGN mode) with: theme-id, logo path +
vision notes path, scrape output path, palette, archetype, context hint,
registry path `tools/.theme-fingerprints.json`, and the menu section
pointers in new-theme SKILL.md. It must return with
`check-theme-uniqueness.mjs` already green on its concept.

Sanity-check the returned component list covers at minimum: header (incl.
top bar + mobile nav), hero, vehicle card, 2+ homepage sections, footer,
inventory toolbar+grid, vehicle detail (gallery / specs band / sidebar /
sticky bar), enquiry+sell forms. Push back once if thin; then proceed.

## Stage 2 — Scaffold

Spawn `theme-scaffolder` with theme-id, DNA path, design package path. It
returns with `theme:sync` + `tsc` + `check-theme-contract` +
`check-color-contract` green. If red after its own retries, fix-forward via
a second scaffolder spawn with the error report — don't build on a red base.

## Stage 3 — Infrastructure for visual verification (main thread)

1. **Brand rows** (Flask/MySQL previews — needs `.env` `MYSQL_*` creds):
   - Real brand: `python tools/build-preview-from-theme.py --theme-id <id> --brand-name "<Dealer>" --slug <id>-qa`
   - Light-palette brand (dark-assumption killer — REQUIRED even for light
     themes): clone the row with light colors via inline python
     (`PYTHONPATH=<repo root>`, load `.env` into env first):
     `PreviewStore().upsert_row(slug='<id>-qa-light', name=..., created_at=..., updated_at=..., config_json=...)`
     with `config['theme'] = {'id': '<id>', 'colorsAuto': True, 'colors': {'primary': <brand hex>, 'secondary': …, 'accent': …, 'bg': '#ffffff'}}`.
2. **Dev server** (ONE instance owns `.next/dev/lock`):
   - Kill strays: `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ? { $_.CommandLine -match 'next' } | % { Stop-Process -Id $_.ProcessId -Force }`; remove stale `.next/dev/lock`.
   - Ensure Flask API is serving `http://localhost:5000/api/previews/<slug>` (start `python app.py` in background if not).
   - Start `npm run dev` in background. Do NOT set `NEXT_PUBLIC_BRAND` —
     brands resolve per-request by hostname: `http://<slug>.lvh.me:3000`
     (lvh.me → 127.0.0.1; needs internet DNS. Offline fallback: pass
     `--resolve <slug>.carous.co.uk` to theme-shots and use that host).
   - Smoke: one `tools/theme-shots.mjs` shot of `/` for the real brand
     before entering the loop; debug infra now, not inside the loop.
3. Record slugs, base URLs, and shots dir (session scratchpad) in `state.json`.

## Stage 4 — Component loop (the core)

Process components in spec order. Components whose `depends-on` chains
overlap run SEQUENTIALLY (header → hero); independent ones may batch 2–3
builder spawns in parallel — but their verifier runs still happen per
component.

Per component — the belt is **build → furnish → verify → fix**:

1. Spawn `theme-component-builder` (BUILD mode): spec path, design-language
   path, theme-id. Record assumptions it reports.
2. Spawn `theme-furnisher` (FURNISH mode): theme-id, component id, spec path
   (it reads the spec's `## Furnishing` block), design-language + concept
   (`archetype`/`oneBigMove`). It elevates the built component to rich,
   archetype-appropriate design (imagery / motion / neon-or-refined / canvas /
   micro-interactions) within the mobile + reduced-motion floors. A plain
   component must NOT reach the verifier.
3. Spawn `theme-verifier` (COMPONENT mode): theme-id, component id +
   iteration, spec path, routes where it renders, real-brand base URL,
   shots dir. It runs the desktop widths, the **furnishing judgement**, AND
   the **real small-device pass** (`--device iphone13,androids` +
   `--reduced-motion`). **Server stays up; agents never start/stop it.**
4. On `PASS` → mark passed, next component.
5. On `FAIL` → spawn `theme-design-director` (FIX mode) with the verdict +
   screenshots. Route by issue type: a `furnish` issue → the fix goes to
   `theme-furnisher` (FIX mode); a build/layout issue → `theme-component-builder`
   (FIX mode). Then verifier again (iteration+1).
6. On `INFRA` → fix the infrastructure yourself, re-run the same verifier
   iteration (does not count against the cap).
7. **Cap: 3 fix cycles.** Still failing → mark `escalated` in state.json,
   continue with remaining components, and put the component + latest
   screenshots + verdict in your final report for Difatha. NEVER silently
   ship an escalated component.

After a component passes, if its fixes changed anything a later spec depends
on (spacing rhythm, header height), note it in the next builder's spawn
prompt.

## Stage 5 — Integration + full-page verification

1. Spawn `theme-integrator` with theme-id, design package path, passed
   component list. It returns with contract gates green + CHECKLIST status.
2. Spawn `theme-verifier` (FULL-PAGE mode): all routes × 505/768/1024/1440 ×
   BOTH brands (real + `-qa-light`). Route issues back through the Stage 4
   loop for the owning component (fresh iteration budget of 2 per component
   for page-level findings).

## Stage 6 — Gate suite + ship (main thread)

Run and require ALL green (any red → route back to the owning agent):

```
npm run theme:sync
npx tsc --noEmit
node tools/check-theme-contract.mjs --id <id>
node tools/check-color-contract.mjs --id <id>
node tools/audit-theme.mjs --id <id>
node tools/check-theme-uniqueness.mjs --id <id>
node tools/check-theme-similarity.mjs --id <id> --peer-threshold 0.55
node tools/check-theme-contrast.mjs --id <id>
node tools/check-image-contract.mjs --id <id>
```

Then:
- Append the fingerprint to `tools/.theme-fingerprints.json` (new-theme
  Phase 11 format). If the concept COINED a new signature-move id, also
  append it + its one-line description to the Signature Move menu in
  `.claude/skills/new-theme/SKILL.md` — coined ids register only at ship
  time, never for unshipped/smoke themes.
- Preview: local `python tools/build-preview-from-theme.py …` is already
  done (QA brand); for a real prospect preview use
  `node tools/create-preview.mjs` (needs `BRANDSTUDIO_API_KEY`) per
  new-theme Phase 13c.
- `docs/FEATURE_LOG.md` entry; Slack summary (brandstudio is allowlisted)
  after the theme lands.
- Final report to Difatha: concept sentence, component table
  (iterations / status), escalated items with screenshots, preview URL.
- Leave the QA brand rows in place for review; note their slugs. Offer
  cleanup (`delete_row`) rather than auto-deleting.

## Non-negotiables for the orchestrator

- Zero-issue bar: `PASS` verdicts and green gates are the ONLY definition of
  done. Difatha finding a design bug the verifier had evidence for is a
  pipeline failure.
- Don't do agents' jobs in your own context — if you catch yourself reading
  component CSS, spawn the right agent instead.
- One dev server, orchestrator-owned. Kill it when the run ends.
- Screenshots at 505px minimum width, never narrower (headless Chrome
  clamps ~500px and fakes mobile overflow).
- Escalations are surfaced with evidence, never buried; the run is not
  "complete" while any component is `escalated` unless Difatha accepts it.
