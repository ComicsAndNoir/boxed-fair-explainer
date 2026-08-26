# Requirements — "How Boxed Keeps It Fair" Onboarding Explainer (Prototype)

## 1. Context & purpose

This is a **product demo prototype**, not production code. It is being built to
demonstrate product thinking to the Loot Labs / Boxed.gg hiring team, and could
seed a real onboarding feature.

**The problem it solves:** Boxed.gg's "provably fair" system is a genuine trust
feature, but for a newcomer it is buried in cryptography jargon (server seed,
client seed, nonce, salt, hashing). New users are asked to trust a system they
can't understand at the exact moment they're deciding whether to spend money.
This prototype is a **visual, plain-language walkthrough** that makes the fairness
guarantee obvious to a non-technical person — and is honest about what that
guarantee does and does not cover.

**Primary goal:** a first-time user finishes the walkthrough able to say, in their
own words, "The site can't rig which card I get, and I can check that myself."

## 2. Audience

- **Non-technical collectors and first-time users.** Assume zero cryptography
  knowledge. Terms like *salt*, *nonce*, *hash*, and *HMAC* are meaningless and
  intimidating to this audience and MUST NOT be the primary way anything is
  explained.
- Use everyday metaphors and visuals first; expose the real technical term only
  as a small, secondary "the industry calls this ___" label for the curious.

## 3. Guiding principles (the most important section)

1. **Visual over verbal.** Every concept must be carried by an animation,
   diagram, or interaction FIRST, with text as support — never a wall of text.
   If a step can only be understood by reading, it isn't done.
2. **Plain language first, jargon second.** Lead with the metaphor. Offer the
   real term (nonce, salt, etc.) only inside an optional "what's this really
   called?" tooltip/toggle, clearly marked as extra detail.
3. **Honest about the boundary.** The explainer must clearly separate two ideas:
   (a) *the draw is honest* — the site can't change which card you win after the
   fact (this is what provably fair guarantees); and (b) *the odds themselves* —
   whether a card is rare or common is a published, separate thing that provably
   fair does NOT make "generous." Being candid about this is a deliberate trust
   feature, not a disclaimer to hide.
4. **Show, let them do it.** The user should be able to click through an actual
   (simulated) draw and then click a "verify" button that visibly re-checks the
   result, so fairness is something they *experience*, not just read about.

## 4. Two clarifying decisions (already made — build to these)

- **Cryptographic model:** Use the **industry-standard provably-fair model**
  (a committed secret value revealed later + a value the user controls + a
  per-draw counter, combined and hashed, the result mapped onto the odds table).
  Because this is a generic illustration and not Boxed's exact published
  algorithm, the UI **must clearly call this out** — e.g. a persistent, visible
  label such as *"Illustrative example using the industry-standard method — the
  real system follows the same principle."* Do not present it as Boxed's exact
  implementation.
- **Dynamic odds:** Assume the **drop-table odds are adjusted as real-world card
  prices move.** The explainer should acknowledge this: the odds are published
  and honored for *your* draw, but they can change over time as the market moves.
  This reinforces principle #3 — "fair draw" is separate from "which odds were in
  effect."

## 5. The walkthrough — four steps

Structure the experience as a guided, four-step story the user advances through
(next/back, with progress indication). Each step below lists the idea, the
plain-language framing, the real term (secondary), and the visual to build.

### Step 1 — "The site locks in its answer before you play" (Commitment)
- **Idea:** Before you open a box, the site secretly decides the randomness it
  will use and shows you a sealed, tamper-proof "fingerprint" of it. It can't
  change its mind later without you noticing.
- **Metaphor:** A sealed envelope / a padlocked box whose unique wax seal you can
  see now but whose contents are revealed later.
- **Real term (secondary):** *server seed* and its *hash*.
- **Visual:** Animate the site placing a card/value into an envelope, sealing it,
  and handing the user a visible "seal" (fingerprint). Emphasize: the seal is
  shown BEFORE the draw.

### Step 2 — "You add your own ingredient" (User input)
- **Idea:** You contribute your own value that the site can't predict or change.
  Because your input is mixed in, the site couldn't have pre-arranged a bad
  result for you.
- **Metaphor:** You add your own secret ingredient to the mix / you shuffle the
  deck yourself / you pick the dice.
- **Real terms (secondary):** *client seed* (yours to set), plus *nonce* (a
  counter so each draw is unique) and *salt* (extra site randomness) — all shown
  only as optional detail, described in one plain sentence each if expanded.
- **Visual:** Show the user's ingredient dropping into a mixing bowl alongside the
  sealed envelope from Step 1 and a little counter ticking up for "which draw this
  is." Keep the counter and salt visually minor.

### Step 3 — "The mix decides your card — on odds you saw up front" (The draw + mapping)
- **Idea:** The sealed value + your ingredient are blended into a single
  unpredictable number. That number points to a slot on the box's odds table,
  and that slot is your card. Show the odds table openly.
- **Metaphor:** A spinner / wheel / ruler where each card occupies a slice sized
  by its odds (common cards = big slices, rare = tiny slivers). The blended number
  is the pointer landing on a slice.
- **Real terms (secondary):** *hashing* → a *result number* mapped to the *drop
  table*.
- **Visual:** The core visual of the whole piece. Animate the two ingredients
  combining into a pointer that travels along a proportional odds bar/wheel and
  lands on a card. Display the drop table (cards + % odds + Gem value) beside it
  so the user sees the outcome came from the published odds.
- **Dynamic-odds callout here:** a small note that these odds can shift over time
  as card market prices move, but the odds shown were the ones in effect for this
  draw.

### Step 4 — "Check it yourself" (Reveal & verify)
- **Idea:** Afterwards, the site opens the sealed envelope. You confirm the seal
  matches what you were shown at the start (proof it was never swapped), then
  re-run the blend yourself and see the same card come out. Nothing was rigged.
- **Metaphor:** Breaking the wax seal and confirming it's the same one; re-playing
  the moment and getting the identical result.
- **Real terms (secondary):** revealing the *server seed*, re-hashing to match the
  published hash, replaying to reproduce the outcome.
- **Visual:** Animate the envelope opening, the seal snapping onto the original
  fingerprint (a satisfying "match!" confirmation), and a "Verify" button the user
  presses to watch the same result regenerate. End on a plain-language summary of
  what was just proven — and, per principle #3, what it does not prove (that the
  odds are good value).

## 6. Functional requirements

- Linear, guided flow through the four steps with **Next / Back** and a visible
  **progress indicator** (e.g. 1–4 dots or a bar).
- A **working simulated draw**: use a sample drop table (below). The "verify" step
  must actually re-derive and match the same outcome deterministically, so the
  demo is real, not faked. (A standard HMAC-SHA256-style hash of the combined
  values → number → mapped to weighted odds is fine; determinism is what matters.)
- **"Try again" / re-roll** so a viewer can open several boxes and watch different
  cards land on the same published odds.
- A **jargon toggle**: a global control (e.g. "Show the technical terms") that
  reveals the real names (server seed, client seed, nonce, salt, hash) as
  secondary labels/tooltips. Default is OFF (plain-language only).
- The **illustrative-model disclaimer** (Section 4) must be visible/persistent,
  not hidden behind a toggle.

## 7. Visual & design requirements

- **Highly visual, animation-led.** Prioritise motion and diagrams; minimise text
  blocks. Smooth transitions between steps.
- **Mobile-friendly / responsive** — many Boxed users are on phones. No horizontal
  page scroll; wide elements (odds table) scroll within their own container.
- **On-brand-ish but neutral.** Match the general feel of a modern, dark,
  gaming/collectibles product (Boxed.gg leans dark, energetic). Don't copy Boxed's
  exact assets or logos — this is a concept demo. Use placeholder card art
  (colored rarity tiers, simple icons) rather than real licensed card images.
- Clear rarity visual language: common / uncommon / rare / jackpot distinguished
  by color and slot size so the odds are intuitively legible.
- Accessible: legible contrast, readable font sizes, animations that don't rely on
  color alone to convey meaning.

## 8. Sample data (use for the simulated box)

A single example box, "Starter Slab Box," with an illustrative drop table
(values in Gems; odds sum to 100%):

| Card (placeholder)        | Rarity   | Odds    | Gem value |
|---------------------------|----------|---------|-----------|
| Common Trainer            | Common   | 70.00%  | 20        |
| Foil Sidekick             | Uncommon | 22.00%  | 120       |
| Holo Champion             | Rare     | 7.00%   | 900       |
| Graded Legend (1-of-few)  | Jackpot  | 1.00%   | 25,000    |

- Box price (illustrative): ~250 Gems. This lets an attentive viewer see the
  house-edge concept if they look, but the prototype's focus is fairness, not EV —
  do not build out full economy tooling here.

## 9. Suggested tech (non-binding)

- Single self-contained build the team can open and demo easily. A single-page
  app (plain HTML/CSS/JS, or React if preferred) with the hashing done in-browser
  (Web Crypto API `crypto.subtle` for SHA-256). No backend required — the
  server-seed "commitment/reveal" can be simulated client-side for the demo, with
  a note that production would do this server-side.
- Keep dependencies light; the deliverable should be easy to run and share.

## 10. Out of scope (for this prototype)

- Real Boxed.gg APIs, real card images/logos, or real user accounts.
- Full economy / expected-value simulator (that's a separate demo).
- Real payments, deposits, or shipping flows.
- Boxed's exact proprietary algorithm — we intentionally use the industry-standard
  model, clearly labeled.

## 11. Acceptance criteria

1. A non-technical person can complete all four steps and correctly explain, in
   plain words, that the site cannot change which card they win and that they can
   check it themselves.
2. Each of the four steps communicates its idea primarily through a visual /
   animation, not text.
3. The words *salt*, *nonce*, *server seed*, etc. never appear as the primary
   explanation; they exist only as optional, secondary detail behind the jargon
   toggle.
4. The simulated draw is deterministic and the "verify" step visibly reproduces
   the same result.
5. The UI clearly and persistently labels the crypto model as an illustrative,
   industry-standard example, not Boxed's exact system.
6. The experience acknowledges that published odds can shift over time as card
   market prices move, while the draw honors the odds shown for that opening.
7. The experience is honest about the boundary: "fair draw" (guaranteed) vs.
   "good odds/value" (separate and not guaranteed by fairness).
8. Works and reads well on a phone-sized screen.
