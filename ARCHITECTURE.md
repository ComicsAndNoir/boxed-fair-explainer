# Architecture — "How Boxed Keeps It Fair" Explainer

Companion spec to [boxed-provably-fair-explainer-requirements.md](./boxed-provably-fair-explainer-requirements.md).
Records the decisions made during solution architecture review and the resulting
structure. Deviations from generic best practice are called out with rationale.

## 1. Confirmed decisions (from review)

| Decision | Choice | Why |
|---|---|---|
| Platform | Web (React + Vite + TypeScript), not React Native | Requirements doc explicitly specs a self-contained, browser-runnable single-page app; a native build would add friction for the hiring team to open and demo. |
| Crypto | Web Crypto API (`crypto.subtle`), true HMAC-SHA256 | Matches "industry-standard provably fair model" and runs entirely client-side, no backend needed. |
| Brand fidelity | Exact-replication tokens extracted from a boxed.gg screenshot | Dark navy surfaces, blue primary accent, lime-green secondary accent, violet/cyan currency icons, **Poppins** typography, generous corner radius, glow-based elevation instead of drop shadows. See `src/styles/tokens.css`. |
| Structural system | Material Design 3 principles (8dp grid, type scale, state layers, elevation-via-tint, ≥48px touch targets, standard motion curves), hand-built rather than importing `@material/web` | A literal MD3 component library ships its own baseline styling and uses Shadow DOM, which fights a full brand reskin and the springy, game-y motion this needs. Building custom components *to* the MD3 rules keeps the accessibility/usability benefits without the visual straitjacket. |
| Card art | CSS/SVG rarity-tier shapes, no illustrated assets | Fast, no asset pipeline, keeps focus on animation/interaction per requirements Section 7. |
| Animation | Framer Motion | Declarative step transitions, spring physics for the seal/wheel, built-in `useReducedMotion` support. |
| Icons (UI chrome, not cards) | Lucide (or comparable line-icon set) | Matches the flat line-icon language visible in the boxed.gg screenshot; MIT-licensed, tree-shakeable. |
| State management | One scoped `useReducer` + context (no Zustand/TanStack Query) | There is no server data — the entire flow is deterministic client-side math over a static drop table. Global state libraries would add ceremony with nothing to manage. |
| Disclosure model | Per-element click-to-expand info (envelope, seal, ingredient, spinner, etc.) *plus* the required global jargon toggle | Elevates requirements Section 6's single toggle into the "each element clickable to understand more" behavior requested, while the toggle still governs whether the real term is shown inside each expansion. |

**Flagged, not blocking:** "Try again" UX — see §5.4. I made a call; open to revisiting.

## 2. Directory structure (Component Scaffolding)

```
src/
  main.tsx
  App.tsx
  styles/
    tokens.css              # boxed.gg-derived CSS custom properties (color, radius, elevation, type scale)
    motion.ts                # shared Framer Motion variants + MD3-style easing curves
    global.css
  domain/                    # pure, framework-free logic — unit-testable in isolation
    provablyFair.ts           # generateServerSeed, hashServerSeed (SHA-256), deriveResult (HMAC-SHA256), mapToOutcome
    dropTable.ts               # Starter Slab Box sample data + cumulative-odds mapping helper
    types.ts
  hooks/
    useProvablyFairDraw.ts     # the state machine (see §3)
    useJargonToggle.ts          # persisted (localStorage) global toggle
    useReducedMotion.ts
  components/
    layout/
      AppHeader.tsx              # persistent "illustrative example" disclaimer (Section 4/6 requirement — always visible, not behind a toggle)
      StepShell.tsx                # progress dots/bar + Next/Back chrome
    overview/
      Overview.tsx                # landing screen — visual summary of all 4 stages, "Start the walkthrough" CTA
    wizard/
      Step1Commitment.tsx
      Step2UserInput.tsx
      Step3DrawAndMap.tsx
      Step4RevealVerify.tsx
    shared/
      InfoReveal.tsx                # click-to-expand concept explainer; reads jargon-toggle context
      JargonToggle.tsx
      OddsTable.tsx                  # horizontally-scrollable on narrow viewports
      RarityCardIcon.tsx              # CSS/SVG placeholder art, color + icon + text label per rarity
      SealFingerprint.tsx              # animated envelope/seal visual (Step 1 & 4)
      OddsWheel.tsx                     # proportional spinner/bar (Step 3)
index.html
vite.config.ts
```

Mirrors the required separation of concerns: `domain/` is pure data orchestration
(the "services" layer), `hooks/` is business logic, `components/` stay presentational
and consume hooks/context rather than computing crypto or odds themselves.

## 3. Data flow matrix

The RN version of this section maps JS-thread ↔ native-thread state transfer; the
web equivalent is main-thread synchronous state vs. the async Web Crypto calls.

| Stage | Trigger | Computation | Where it lives | Rendered result |
|---|---|---|---|---|
| Commit | App/Step 1 mount | `serverSeed = crypto.getRandomValues(32 bytes)`; `hash = SHA-256(serverSeed)` | `useProvablyFairDraw` state (serverSeed kept in memory, never rendered until reveal) | Sealed "fingerprint" (hash, truncated + monospace) shown in `SealFingerprint` |
| User input | Step 2 | User edits `clientSeed` (text input, pre-filled with a random default); `nonce` auto-tracked per draw | Reducer state | Ingredient drop animation; nonce shown as a minor ticking counter |
| Draw | User presses "Open box" (Step 3) | `result = HMAC-SHA256(serverSeed, clientSeed:nonce)` → take leading hex → normalize to `[0,1)` float → walk `dropTable`'s cumulative odds to find the landing slice | Pure function in `domain/provablyFair.ts`, called from the hook | `OddsWheel` animates its pointer to the **actual computed** normalized position — the animation destination is the real math result, never a separately-randomized "fake spin" |
| Reveal | Step 4 mount | Re-expose `serverSeed` in the UI | Reducer state → render | Envelope-open animation, seed shown in plain text |
| Verify | User presses "Verify" | Re-run `SHA-256(serverSeed)` and compare to the hash shown in Step 1; re-run the Step 3 HMAC + mapping from the revealed seed and compare outcome | Same pure functions, called again — genuinely re-derived, not cached-and-replayed | "Match!" confirmation on both the hash and the card outcome |

All crypto calls are `async` (Web Crypto is promise-based) but operate on tiny
payloads (a handful of bytes) — sub-millisecond in practice, so no Web Worker is
warranted for this scope.

## 4. Performance impact assessment

- **Re-render containment**: `OddsWheel` and `SealFingerprint` are the only
  components driving continuous animation; both are isolated leaf components
  reading only their own slice of state so a jargon-toggle flip or step
  navigation elsewhere doesn't re-trigger their animation logic.
- **`prefers-reduced-motion`**: `useReducedMotion` swaps spring/travel animations
  for simple opacity fades — required by requirements Section 7 (accessibility)
  even though not spelled out explicitly for motion.
- **No image weight**: SVG/CSS card art means no decode/layout cost and crisp
  rendering at any viewport size — relevant since requirements Section 7 calls
  out phone-sized screens specifically.
- **Bundle size**: React + Framer Motion + Lucide is a light dependency set,
  consistent with requirements Section 9's "keep dependencies light, easy to
  run and share."
- **Odds table rendering**: `OddsTable` scrolls horizontally within its own
  container (`overflow-x: auto`) rather than letting the page scroll — required
  by Section 7, and avoids layout thrash on resize.

## 5. Notes & open items

### 5.1 MD3 + brand tokens interaction
Type scale, spacing grid, and elevation follow MD3 rules; color values are
swapped for the extracted boxed.gg tokens. State layers (hover/press) use the
primary accent blue at MD3-standard opacities (8%/12%) rather than Material's
default purple.

### 5.2 Font verification
Confirmed as **Poppins** (per screenshot inspection). Loaded via Google Fonts
`<link>` (permitted origin), with a system-sans fallback stack.

### 5.3 Accessibility checklist
- Touch targets ≥48px for Next/Back/Verify/Open-box actions.
- Focus moves to the new step's heading on step change (screen-reader users get
  a clear "you're on step N" cue without relying on the visual progress dots).
- Rarity is always color **+ icon + text label** together, never color alone.
- Contrast of accent blue/lime-green against the near-black background needs a
  quick WCAG AA spot-check once tokens are finalized in code.

### 5.4 Landing screen ("step 0")
`App.tsx` treats the app as steps 0–4: step 0 is `Overview` (a visual preview of all
four stages plus a "Start the walkthrough" CTA), steps 1–4 are the existing
`StepShell` wizard. The two are cross-faded via a top-level `AnimatePresence`
rather than folded into `StepShell`'s own step-to-step transition, since the
overview has no Back/Next chrome or progress dots of its own — it's a distinct
screen, not a fifth wizard step. Step 1's Back button returns to it.

### 5.5 Real-world examples per step
Each of the four steps opens with a `RealWorldExample` banner ("Already trusted,
every day"), rendered above the step's `<h2>` heading via `StepShell`'s `banner`
prop (populated from a lookup array in `App.tsx`, not embedded in the individual
step components — it needs to render before content that belongs to `StepShell`,
not the step itself). It names a household institution that genuinely uses the
same cryptographic primitive — verified against primary sources before writing
any copy, not recalled from memory:

| Step | Institution | Claim | Source (fetched & confirmed) |
|---|---|---|---|
| 1 — Commitment | DocuSign | Tamper-evident seal on signed documents; any later byte-change is detectable | [docusign.com/blog/is-your-esignature-safe](https://www.docusign.com/blog/is-your-esignature-safe) |
| 2 — User input | Visa / Mastercard (EMVCo) | Each chip transaction mixes in a fresh, terminal-supplied unpredictable value so it can't be replayed | [emvco.com/emv-technologies/emv-contact-chip](https://www.emvco.com/emv-technologies/emv-contact-chip/) — mechanism detail cross-checked against [AWS Payment Cryptography docs](https://docs.aws.amazon.com/payment-cryptography/latest/userguide/use-cases-issuers.generalfunctions.arqc.html) |
| 3 — Draw/mapping | Stripe | HMAC-SHA256 — the literal algorithm used here — signs every Stripe webhook | [docs.stripe.com/webhooks](https://docs.stripe.com/webhooks#verify-manually) |
| 4 — Reveal & verify | DocuSign | Certificate of Completion lets any party confirm nothing was altered post-signing | Same DocuSign source as step 1 |

Two deliberate constraints shaped this list, both from user direction mid-build:
1. **No crypto-industry examples.** An earlier pass used Kraken/Coinbase — real
   and verifiable, but crypto-adjacent institutions aren't trusted or familiar
   to Boxed's non-technical target audience, so they were replaced entirely.
2. **Framing discipline.** Copy says "same algorithm/principle, different job"
   rather than implying these companies run a card-draw scheme — Stripe uses
   HMAC-SHA256 for message authentication, not fairness. Overclaiming here
   would undercut the demo's own honesty principle (§3 in the requirements doc).

The landing page (`Overview.tsx`) adds a "Not just theory" strip naming all
four institutions up front — worded as "this exact cryptography already
secures," not "partners with" or "trusted by," to avoid implying an
endorsement or partnership that doesn't exist.

### 5.7 Trust-signal placement: teaser + payoff, not one or the other
UX pass on where the per-step trust content should live. The full
`RealWorldExample` copy contains backward references — "protects it the same
way," "that's the same job your ingredient does **here**" — that only resolve
once the reader has seen the step's own explanation. Placed entirely above the
heading (an earlier iteration), those references point at content the reader
hasn't reached yet, which reads as an unearned appeal to authority rather than
validated understanding — in tension with the demo's own honesty principle.

Resolved as a split, not a single placement, via two new `StepShell` slots:
- **`banner`** (above the `<h2>`) → `TrustTag`, a compact pill naming the
  institution(s) only ("Verified real-world use: **DocuSign**") — no
  mechanism detail, so it needs no prior context to parse. Job: signal up
  front that a real citation is coming.
- **`footer`** (after `children`, i.e. after the step's own explanation and
  jargon reveal) → the full `RealWorldExample` card, where "the same way"
  finally has something to refer back to. Job: pay off the teaser once the
  comparison is meaningful.

Both slots pull from the same `REAL_WORLD_EXAMPLES` entry in `App.tsx`
(`companies` feeds the teaser, `description`/`href`/`linkLabel` feed the card)
— still zero changes needed in the individual `Step1–4.tsx` files.

### 5.6 "Try again" flow — flagged decision
Requirements Section 6 asks for re-roll so a viewer can open several boxes.
Re-running the full 4-step tutorial every time would get tedious. Proposed:
the **first pass** is the full guided walkthrough; a "Try again" action from
Step 4 generates a fresh commitment (new seed/hash/nonce, briefly shown) and
fast-forwards straight into a compact Step 3→4 loop, skipping the Step 1/2
teaching copy on repeat draws. Flagging this since it's a UX call rather than
a stated requirement — happy to adjust if you want every re-roll to replay
the full tutorial instead.

## 6. A/B test mode

The app is now framed as an A/B test comparing Boxed's real, current
explainer against the redesigned walkthrough, ending in a single confidence
question. Three scope decisions were confirmed with the user before building:
session-only results (no backend/persistence), Variant A rebuilt from
extracted real text rather than embedding the raw saved HTML (which has
broken relative asset paths and a dead Intercom SDK call), and a debrief
screen that reveals the variant + answer after submission (demo-only, for
whoever's presenting to discuss).

**Phase state machine** (`App.tsx`, the new top-level orchestrator):
`intro → variant-a | variant-b → survey → debrief`, tracked via `phase`,
`variant` ('A' | 'B'), and `answer` (`ConfidenceAnswer`). The previous entire
app (AppHeader + Overview/wizard) was extracted verbatim into
`components/wizard/VariantBExplainer.tsx`, unchanged apart from a new
`onFinish` prop threaded to `Step4RevealVerify` as a "Continue to survey"
button alongside the existing "Open another box." Its internal step/draw
state needs no explicit reset between demo runs — React's unmount when
`phase` leaves `'variant-b'` handles that for free.

**New content module**: `domain/existingExplainerContent.ts` holds the real
Help Center article's actual text (headings, paragraphs, verify steps, FAQ),
extracted from `existing_explainer/boxed_gg_provably_fair.html` with
script/style stripped — not paraphrased. `components/abtest/VariantAArticle.tsx`
renders it deliberately plain (no animation, no jargon toggle, no illustrative
disclaimer) since none of that is part of the real article, and adding it
would make the comparison unfair.

**Neutrality**: `ConfidenceSurvey.tsx` shows the same question regardless of
which variant was viewed, with no "Version A/B" labeling or branding hint
that could prime the answer — that reveal is deferred to `Debrief.tsx`,
strictly after submission.

**New directory**:
```
src/components/abtest/
  ABTestIntro.tsx          # landing page: explains the test, lets viewer pick A or B
  VariantAArticle.tsx        # plain reproduction of the real Help Center article
  ConfidenceSurvey.tsx        # the single end-of-test question, variant-blind
  Debrief.tsx                  # demo-only reveal + recap + restart/switch actions
```

### 6.1 Mobile disclaimer collapse
`AppHeader`'s illustrative-model disclaimer collapses on mobile (≤639px)
once the active scroll container moves >16px from the top, and reappears at
the top — via `useMobileScrollCollapse`, a capture-phase scroll listener on a
`display: contents` wrapper around `VariantBExplainer`'s whole return value.
Scroll events don't bubble, but capture-phase listeners on an ancestor still
see them, so this works no matter which inner panel (`Overview`'s wrapper,
`StepShell`'s content) is actually the one scrolling, without threading a
ref through either. Desktop is untouched — gated behind the same
`matchMedia` check, not just a smaller collapse effect.

### 6.2 "Show me the actual math" (MathReveal)
Step 4 asked for something more convincing than "it matches, trust us."
`MathReveal` (behind its own click-to-expand, independent of the jargon
toggle) genuinely recomputes every intermediate value for *this* draw — not
a staged example — via `useVerificationTrace`, then walks through: re-hash
vs. the step 1 fingerprint, the HMAC-SHA256 recompute, the resulting
percentage, and that percentage against the actual published cumulative odds
ranges (`domain/dropTable.ts`'s new `computeCumulativeRanges`), highlighting
which range it lands in. Cross-checked in-browser against the hash/seed
shown elsewhere on the page — identical, since it's the same underlying
pure functions, just also surfacing the intermediate output instead of only
the pass/fail booleans `useProvablyFairDraw`'s `verify()` already produced.
Gated on `bothMatch` (i.e., shown after the primary "Verify" confirmation) —
additive proof for the curious, not a replacement for the simple flow.

### 6.3 Vertical-rhythm tightening
Measured at a realistic laptop browser viewport (1280×700, accounting for
browser chrome): Step 1's content was 660px tall in a 449px visible window —
211px below the fold, with the "Already trusted" trust card not starting
until 69px past the fold. Two categories of cause, both fixed at the source
rather than by shrinking type or removing content:

1. **Accumulated gap/padding**: `StepShell`'s `.content` had a 24px gap
   between *every* child (5 gaps ≈ 120px on a typical step) plus 16–24px of
   padding on each side; `.progress` and `.nav` were similarly generous. A
   desktop-only media query also reused `--space-4` for both padding axes,
   which meant vertical padding *grew* by 16px specifically at laptop widths
   while only horizontal padding needed to. Tightened `.content`'s gap to
   `--space-3`, padding to `--space-2` vertically (keeping `--space-6`
   horizontal on desktop, now on its own axis), and trimmed `.progress`,
   `.nav`, and `AppHeader` proportionally.
2. **`SealFingerprint` was intrinsically 215px tall** — its 160px
   `.visualArea` min-height wasn't even the binding constraint. Reduced the
   seal circle 96px → 76px (icon 36px → 28px to match) and its internal
   padding/gap, and dropped `.visualArea`'s min-height to 100px.

Result: Step 1's content dropped to 528px against a 509px window — 19px of
overflow, down from 211px — with the entire trust card now visible on load
instead of requiring ~150px of scroll. Verified across all four steps, plus
mobile and a generously tall (1000px) desktop viewport for regressions: no
console errors, nothing dropped below the 48px touch-target minimum, and the
tall-viewport case just leaves extra breathing room below the content rather
than looking broken (content stays top-anchored, not vertically centered —
an accepted tradeoff, not pursued further since the ask was the laptop case).
Step 3 and 4 — the two densest steps — still need a small scroll to reach
their trust card, which is expected given how much they each show; further
compression there started trading away visual hierarchy for diminishing
returns.

### 6.4 Google Analytics (GA4)
The `gtag.js` snippet is hardcoded directly in `index.html`'s `<head>`
(Google's standard boilerplate, unmodified) rather than injected conditionally
from JS — it loads unconditionally now, **including on localhost**. This is a
deliberate reversal of an earlier version that gated loading behind an
`isLocalHost()` check; the user asked for that gate to be removed in favor of
matching a specific snippet exactly, so the tradeoff (dev traffic can reach
GA once a real Measurement ID is in place) is intentional, not an oversight.

**Measurement ID injection**: `index.html` uses a `__GA_MEASUREMENT_ID__`
placeholder in both spots the snippet references it. `vite.config.ts` defines
a small `transformIndexHtml` plugin (`injectGaId`) that resolves the real
value via `loadEnv` — from `VITE_GA_MEASUREMENT_ID` if set (only expected to
be set in deployed environments, e.g. Render), falling back to the dummy
`G-XXXXXXXXXX` otherwise — and substitutes it at both build time and in the
dev server (Vite calls `transformIndexHtml` for both, so `npm run dev` and
`npm run build` behave consistently). Verified directly: built `dist/index.html`
with no env var set shows `G-XXXXXXXXXX` in both spots; rebuilding with
`VITE_GA_MEASUREMENT_ID=G-REAL12345` set shows that real value in both spots
instead. `src/lib/analytics.ts` no longer owns the ID or the loading logic —
it's now purely the custom-event/virtual-pageview layer on top of whatever
`window.gtag` the head snippet already defined.

**Resolved double-count**: the snippet's own `gtag('config', ...)` call sends
one automatic pageview on load, same as `trackPageView`'s virtual pageview for
the initial "intro" phase — so the very first landing pageview would double-
count between the two. Fixed by adding `{ send_page_view: false }` to the
`config` call (the one deviation from the snippet as literally given, at the
user's explicit follow-up request) — `trackPageView` is now the sole source
of every pageview, including the first, each with a real `page_path` the
automatic one never had anyway. Verified via a production build: `dataLayer`
shows exactly one `page_view` event on load, for `/intro`.

Confirmed via a production build (`vite preview`, not the dev server) that
custom events land in `dataLayer` correctly and exactly once per action —
`npm run dev`'s apparent double-firing on the very first click is React
StrictMode's dev-only double-invoke of effects, not a real duplicate; it
doesn't happen in the actual built app.

**Funnel tracking**: this SPA has no router — `App.tsx`'s `phase` state and
`VariantBExplainer`'s `step` state are the only "navigation" that exists.
Since GA's path/funnel exploration reports key off `page_view`, both fire a
virtual `page_view` (`page_path`, `page_title`) on every phase/step change:
`App.tsx` owns `/intro`, `/variant-a`, `/survey`, `/debrief` (deliberately
excludes `variant-b`, which has no single path); `VariantBExplainer` owns
`/variant-b/overview` and `/variant-b/step-{1..4}`. Together these let GA
reconstruct the full path from landing page through either A or B.

**Named events** on every meaningful click, each carrying enough params to
be individually identifiable: `select_variant`, `continue_to_survey`,
`submit_survey`, `try_other_variant`, `restart_demo` (all in `App.tsx`, the
natural single choke point for those actions since it already distinguishes
"fresh pick from intro" from "switch from debrief" — `tryOtherVariant`
fires both `try_other_variant` and, via `chooseVariant`, `select_variant`,
which is intentional: the latter marks every variant activation, the former
annotates specifically that this one was a switch); `click_nav`, `open_box`,
`verify_draw`, `try_again` (`VariantBExplainer`); `expand_info`
(`InfoReveal`, `MathReveal` — carries the trigger's own label as the
identifier); `toggle_jargon` (`JargonToggle`); `click_real_world_link`
(`RealWorldExample`, outbound link clicks); `shuffle_client_seed`
(`Step2UserInput`).

## 7. Acceptance criteria traceability

Each item in requirements Section 11 maps to a concrete mechanism above:

1. Plain-words comprehension → guided 4-step copy + `InfoReveal` expansions.
2. Visual-first → Framer Motion animation is the primary explainer for each step; text is caption-level.
3. No jargon as primary explanation → jargon strings live only inside `InfoReveal`, gated by `useJargonToggle` (default off).
4. Deterministic verify → §3's Verify row — same pure functions, genuinely re-executed.
5. Illustrative-model disclaimer → `AppHeader`, always rendered, not toggle-gated.
6. Dynamic-odds acknowledgment → static copy block in `Step3DrawAndMap`, sourced from requirements Section 4.
7. Fair-draw vs. good-odds honesty → explicit closing copy in `Step4RevealVerify`.
8. Phone-sized screens → MD3 responsive grid, `OddsTable` internal scroll, no page-level horizontal scroll.
