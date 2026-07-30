# Design-package format — shared contract between design-director, builders, verifier, integrator

Everything the multi-agent pipeline exchanges lives in one folder per theme:

```
tools/.theme-designs/<theme-id>/
  design-language.md          # the theme-wide design system + section-flow contract (designer writes)
  research-notes.md           # distilled research findings (designer writes, once)
  components/
    01-header.spec.md         # one spec per component, NN = build order
    02-hero.spec.md
    ...
  verdicts/
    <component-id>-<iteration>.json   # verifier output, append-only
  fixes/
    <component-id>-<iteration>.md     # designer fix-mode output
  state.json                  # orchestrator-owned run state
```

`tools/.theme-concepts/<theme-id>.json` (fingerprint concept) is written by the
designer in the same pass — that file's schema is owned by
`tools/check-theme-uniqueness.mjs`, not this doc.

---

## design-language.md — required sections

1. **Signature concept** — the one-sentence locked direction (same text as the
   concept JSON) plus 3–5 sentences of design intent a builder can act on.
2. **Voice** — the personality voice id + 3 example microcopy lines.
3. **Type system** — heading font, body font, the full scale (rem values, max 5
   distinct sizes unless `oneBigMove: typography-scale`), title treatment
   (case, weight, letter-spacing), `clamp()` bounds for hero/page titles.
4. **Space & container** — section vertical rhythm (`clamp()` values),
   container widths (standard + wide/inventory), grid gutters.
5. **Surface grammar** — radius scale, border style, shadow policy (headers:
   none — border-bottom only), how `--color-surface` vs `--color-bg` alternate.
6. **Motion grammar** — which mfx/AOS moves are allowed, durations, and the
   reduced-motion story.
7. **Section-flow contract** — per route, the ordered list of sections with:
   - background token per section: `bg` / `surface` / `primary-tint NN%`,
     where `primary-tint NN%` is canonically
     `color-mix(in srgb, var(--color-primary) NN%, var(--color-bg))` —
     never mixed over `transparent` (stacks differently)
   - the alternation rule (no two adjacent identical surfaces unless separated
     by a hairline; state exceptions explicitly)
   - adjacency handoffs: what each section promises the next (e.g. "header is
     translucent over hero; hero top padding accounts for header height",
     "hero ends with hairline assurance strip; trust band must NOT repeat it")
8. **Do-not list** — theme-specific bans on top of build-rules.md (e.g. "no
   uppercase anywhere", "no gradients — oneBigMove is decorative-density").

Page composition in §7 is what the integrator builds to and the verifier's
full-page mode checks. Every route in the canonical whitelist must appear.

---

## Component spec — `components/NN-<id>.spec.md`

Template (all sections required; write "n/a" only with a reason):

```markdown
# <NN> — <Component name>
id: <kebab-id>                 # stable key used in state.json / verdicts
files: components/<Name>.tsx, styles or <Name>.module.css, (wiring files)
depends-on: <ids or none>      # earlier components this one visually chains from

## Purpose
One paragraph: what this component does for a UK dealer buyer.

## Unique move
The ONE thing that makes this component unlike its counterpart in any other
theme. Must be concrete ("nav items carry a numbered prefix 01–05 in muted
mono") not vibes ("feels premium").

## Adjacency contract
- Above: <what sits above and the handoff rule>
- Below: <what sits below and the handoff rule>
- Promises: <what this component guarantees to neighbours — heights, hairlines,
  background token it ends on>

## Layout
- **360 (base CSS, verify at 505):** <single-column layout, what is hidden,
  the ONE primary CTA, tap targets>
- **768:** <what gets added>
- **1024:** <desktop structure>
- **1440:** <wide behaviour — what stops growing>

## Tokens
Backgrounds, foregrounds, accents — 8-token natural roles / --t-* aliases /
color-mix recipes only. List every pair (surface + paired foreground).

## States
hover / focus-visible / active nav / empty data / loading / error — whichever
apply, with concrete treatment.

## Furnishing
The conveyor-belt furnisher builds to THIS block; the verifier gates it. A
component with no meaningful furnishing is a defect (a "plain" render FAILs).
Fill every line; write "none — <reason>" only with a real reason.
- **Devices (2–4, archetype-appropriate):** the decorative moves this component
  ships — from the archetype's vocabulary (build-rules §14 table). e.g. modern:
  `mfx-glow-pulse`, `CanvasFX particle-drift`, `mfx-text-glow`; luxury: cinematic
  bg image, `CanvasFX aurora-light`, hairline gold rules, soft hover-lift.
- **Imagery:** which `image-recipe.json` slot backs this component (`themeImageCss`),
  or "none". If a new backdrop slot is needed, name it (the furnisher declares it).
- **Entrance + scroll motion:** the `data-aos` reveals (variant + stagger count)
  and any `data-mfx-scroll` parallax/zoom on media.
- **Canvas:** `<CanvasFX variant=…>` (which) mounted where, or "none".
- **Micro-interactions:** hover/focus transitions, card lift, underline sweep,
  ken-burns — with durations (≤200ms-aware, reduced-motion safe).
- **Mobile (≤640):** what heavy decor gets `*-decor-mobile-hide` / drops to a
  static token wash; confirm the component stays calm + tap-target-safe.
- **oneBigMove axis spent here (if any):** which cap this component amplifies.

## Copy keys
Every rendered string → its recipes/text-recipe.json key + default value.
No hardcoded dealer strings.

## Acceptance criteria
AC1..ACn — numbered, individually checkable, screen-specific where relevant.
Each AC must be verifiable from a screenshot or a grep. Examples:
- AC1: at 505px the header is a single row ≤64px tall; socials hidden; wordmark ≤1.25rem
- AC2: no box-shadow under the sticky header at any width (border-bottom only)
- AC3: hero headline wraps to ≤2 lines at 1440 and ≤2 lines at 505
Include at minimum: one mobile-simplification AC, one token/contrast AC, one
adjacency AC, one AC proving the "Unique move" actually shipped, and one
**Furnishing AC** proving the component is furnished per the Furnishing block
(a plain, un-furnished render FAILs) — checkable from a desktop screenshot.
```

---

## Verifier verdict — `verdicts/<component-id>-<iteration>.json`

```json
{
  "component": "header",
  "iteration": 1,
  "verdict": "FAIL",
  "mechanical": {
    "tsc": "pass",
    "colorContract": "pass",
    "audit": "pass",
    "greps": ["fail: box-shadow found header.module.css:41"]
  },
  "issues": [
    {
      "id": "header-1-01",
      "severity": "blocker",
      "criterion": "AC2",
      "route": "/",
      "screen": 1024,
      "evidence": "<abs path to screenshot>",
      "description": "Sticky header paints a drop shadow; spec and build-rules both require border-bottom only."
    }
  ],
  "screenshots": ["<abs paths of all shots taken>"]
}
```

Severity: `blocker` (violates spec AC, build rule, or contract gate — FAIL),
`major` (visibly wrong but not a rule violation — FAIL), `minor` (polish —
recorded, does NOT fail the component alone). 3+ minors: the verifier adds a
synthesized `major` issue row (`id: <component>-<n>-agg`, description citing
the minor ids) — which FAILs the verdict like any major.
`verdict` is PASS only when issues[] contains nothing above minor AND all
mechanical checks pass.

## Designer fix — `fixes/<component-id>-<iteration>.md`

For each issue id: the decision (`fix` / `spec-change` / `reject-with-reason`),
then a concrete instruction the builder can apply without judgement calls —
name the file, the selector/element, the target values. If `spec-change`,
also update the component spec file in place and note the change.

## state.json (orchestrator-owned — agents read, never write)

```json
{
  "themeId": "…", "stage": 3,
  "brandSlug": "…", "lightBrandSlug": "…",
  "components": {
    "header": { "status": "passed", "iterations": 2 },
    "hero":   { "status": "fixing", "iterations": 1 }
  }
}
```

status ∈ pending | building | verifying | fixing | passed | escalated.
