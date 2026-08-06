# How to Think About Frontend Design

> For a backend/Laravel dev doing UI for the first time.
> This is not a list of rules to memorize. It is a **way of looking** at a screen.
> Once you see the way a designer sees, the "rules" become obvious.

---

## 0. The one idea that changes everything

**You are not decorating. You are organizing information so the eye knows where to go.**

A page is not "made pretty" by adding colors, shadows, and gradients. It is made good by
**arranging** things so the most important thing is seen first, related things sit together,
and nothing competes for attention that shouldn't.

Think of it like a database. A messy table with no keys, no types, no order is "bad" — not
because it's ugly, but because you can't find anything. A screen is the same: **good design =
the user finds what matters instantly.** Beauty is a side effect of good organization, not the
goal.

So the question is never *"what color should this be?"* first.
The question is always: **"what is the most important thing here, and is the layout making
that obvious?"**

---

## 1. Learn to SEE before you build — the squint test

Before you write any JSX, look at the screen (or a reference you like) and **squint your eyes**
until it's blurry. Colors and text disappear; you're left with **gray blocks of different
sizes**.

This is the single most useful trick in design. When it's blurry you can finally see the
**structure**:

- Where are the big heavy blocks? (they pull the eye)
- Where is the empty space?
- Do things line up, or is it noisy?
- Is there one clear "hero" block, or is everything the same size?

**If the blurry version looks like a random pile of equal gray rectangles, the design is bad —
no color will fix it.** If the blurry version already has a clear shape (one big thing, grouped
smaller things, clean columns), the design is already good before you add a single color.

> Do this to your own dashboard right now. Squint. You'll see: 6 equal boxes, a sidebar full of
> ~15 equal rows, and a lot of empty gray. That blurry picture is *why* it feels "bad" — nothing
> stands out, everything is the same weight.

---

## 2. Think in COLUMNS — the invisible grid

This is the part you asked about: *"how do I see the columns?"*

Every professional layout sits on an **invisible grid**, almost always **12 columns** wide.
You don't see the grid, but everything lines up to it. Why 12? Because 12 divides evenly into
1, 2, 3, 4, and 6 — so you can make halves, thirds, quarters, sixths, all from the same grid.

Here is how to *see* it. Imagine 12 equal vertical strips across your content area:

```
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
```

Now every block you place is "how many columns wide":

- A full-width banner  = 12 columns
- Two equal cards side by side = 6 + 6
- Three cards in a row  = 4 + 4 + 4
- Four small stat tiles = 3 + 3 + 3 + 3
- A main area + a sidebar panel = 8 + 4 (the classic "content + side" split)

**The rule you were missing:** you don't pick pixel widths. You pick **how many of the 12
columns** a thing takes, and the grid handles the math. When the screen gets narrow (mobile),
those same blocks "stack" — a 4-col card becomes 12-col (full width) so it's readable on a
phone.

### How to decide how many columns

Ask: **how many of these things belong in one row before they get too cramped to read?**

- Big rich cards with a chart inside → 2 per row (6+6) or even 1 (12).
- Simple stat tiles (a number + a label) → 3 or 4 per row.
- A form → usually 1 or 2 columns of fields, never 4 (eyes get lost).

> Your dashboard puts **3 stat cards per row** (each = 4 columns). That's actually a reasonable
> choice. The problem isn't the column count — it's what's *inside* each card (see §4).

In Chakra you express this directly — you don't do math:

```tsx
<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
  {/* base:1 = one per row on phone, md:2 on tablet, xl:3 on desktop */}
</SimpleGrid>
```

That `{ base, md, xl }` object **is** the grid thinking: "on small screens stack them, on big
screens 3 across." Read it out loud and it's a sentence.

---

## 3. Visual hierarchy — make the eye move in the right order

Squint again. Your eye is pulled toward whatever is **biggest, boldest, and highest-contrast**.
That's a tool you control. You have exactly **four levers** to say "this matters more":

1. **Size** — bigger = more important.
2. **Weight** — bolder = more important.
3. **Color/contrast** — brighter against the background = more important. (This is why you use
   *one* strong color for the *one* main action — if everything is blue, nothing is.)
4. **Space** — more empty space around a thing = more important (it gets room to breathe).

**Every screen must have a #1, a #2, and "everything else."** If you can't point at the single
most important element, the user can't either.

> On your dashboard, what is #1? Probably the **"Welcome, {name}"** greeting or the **stat
> numbers**. Right now the six card *numbers* are all the same size and weight, so they all tie
> for #1 — which means there is no #1. That flatness is what reads as "amateur."

A quick test: **turn everything gray except the most important element.** Does the screen still
make sense and guide your eye? If yes, hierarchy is working.

---

## 4. Proximity & whitespace — space is not "empty", it's meaning

Beginners think whitespace is wasted space to fill. **Whitespace is how you group things
without drawing boxes.** The brain reads:

- Things **close together** = related (one group).
- Things **far apart** = different groups.

This is called **proximity**, and it's more powerful than any border or line.

### The mistake in your stat cards (this is important)

Look at one of your cards: the number `10` is jammed against the **left** edge and the car icon
is jammed against the **right** edge, with a huge empty gap between them. It looks *hollow* —
like two strangers standing at opposite ends of an elevator.

Why? Because the card uses `justify="space-between"`, which means *"push these two things as far
apart as possible."* That's the wrong instruction here. The number, the label, and the icon are
**one group** — they describe the same thing ("10 Cars"). They should **cluster together**, not
spread to the edges.

The fix is a thinking fix, not a color fix: *"these belong together, so put them together."*
Icon on the left, then number + label right next to it, all clustered on one side, with the
empty space pushed to the outside as breathing room. Suddenly the card looks intentional and
full instead of hollow.

> Lesson: **empty space belongs on the *outside* of a group (as padding/margin), not *inside*
> it (between related items).** When you see a hollow, stretched-out component, ask: "am I
> spreading apart things that actually belong together?"

### Spacing needs a rhythm

Don't pick spacing by feel (`13px` here, `7px` there). Use a **scale** — a fixed set of steps,
each usually double-ish the last: `4, 8, 12, 16, 24, 32, 48`. Every gap and padding on the
whole app comes from that set. This is exactly like using migrations instead of hand-editing
the DB: constraints make everything consistent for free.

In Chakra the scale is built in (`gap={4}` = 16px, `p={6}` = 24px). **Only use whole numbers
from the scale.** The "rhythm" of consistent spacing is a huge part of why pro apps feel calm.

---

## 5. The sidebar problem — grouping and "visual weight budget"

You said the sidebar **scrolls**, and that's the clearest example of bad *thinking* on the
screen, so let's reason through it properly.

**Why does it scroll?** Because it has ~15 items, and **every item looks equally important** —
same size, same spacing, same weight. The sidebar is treating "Dashboard" (a real page you use
daily) exactly like "Contracts — Soon" (a page that doesn't even exist yet). That's the bug in
the *thinking*, and the scrollbar is just the symptom.

Think of attention as a **budget**. The sidebar has a limited amount of the user's attention to
spend. Right now it spends the same amount on 15 things, so everything is loud and the list is
so long it overflows the screen.

How a designer reasons about it:

1. **Not everything deserves top-level space.** The 9 "Soon" items aren't usable. Do they need
   to sit in the main list at full size, pushing your real navigation off-screen? No. They could
   be smaller, dimmer, collapsed under a "Coming soon" section, or hidden entirely until they
   ship. **Demote what doesn't matter yet.**
2. **Group by meaning** (you started this with MANAGE / SYSTEM — good instinct). Groups let the
   eye chunk 15 items into "3 groups of ~5", which feels short even when the count is the same.
3. **Tighten the rhythm.** Slightly less vertical padding per row and a smaller icon+label size
   can recover a lot of height without feeling cramped.
4. **Pin the important edges.** The logout button and user info should be *always visible* at
   the bottom, not something you scroll to find.

The goal: **the real, usable navigation fits on one screen without scrolling**, and the "someday"
items are visibly secondary. That's a *thinking* fix — deciding what deserves attention — not a
color fix.

---

## 6. Restraint — why "less" looks more expensive

Look at expensive, premium apps (Stripe, Linear, Apple). Count the colors. You'll find: a
near-neutral background, one or two text colors, and **one** accent color used sparingly for the
main action. That's it.

Beginners reach for many colors and gradients to make things "pop". The result looks busy and
cheap, because when everything pops, nothing does. **Pros use almost no color and let *space*
and *hierarchy* do the work.**

> Your six stat cards each use a *different* bright gradient (blue, cyan, green, teal, purple,
> orange). Squint at them: it's a fruit salad. The colors are fighting each other and none of
> them *mean* anything (why is "Car types" purple?). A calmer choice: one accent color for all,
> or color used only to signal *status* (green = good, red = bad) where it actually carries
> meaning. Color should **inform**, not decorate.

Rule of thumb: **if a color isn't communicating something specific, remove it.**

---

## 7. Not-design bugs that still make it look "bad"

Some things read as "bad design" but are actually plain bugs. Learn to separate them:

- **`?????? ?????` instead of the user's name.** That's a **font/encoding bug** — the Arabic
  name is rendering as question marks because the font being used has no Arabic glyphs, or the
  data isn't UTF-8. No amount of layout work fixes this; it's a code bug. Fix the font stack /
  encoding.
- **Sidebar and content are the same dark color.** That's the `bg="sidebar"` token that doesn't
  exist, so it falls back to transparent. A one-line code fix, not a design decision.

> Lesson: when something looks wrong, first ask **"is this a design problem or a bug?"** They
> have completely different fixes. A designer who tries to "style around" a bug wastes hours.

---

## 8. Your repeatable process — how to approach ANY screen

When you sit down to build or fix a screen, go in this order. **Never start with colors.**

1. **List the content.** What information/actions must be on this screen? Write them as a plain
   list, no styling. (Like planning your DB columns before the UI.)
2. **Rank it.** What's #1 (the hero)? What's secondary? What's "nice to have"? This decides
   hierarchy before you touch a pixel.
3. **Group it.** Which items belong together? Each group will become a section or a card.
4. **Lay out the grid.** How many columns does each group take? Sketch boxes on paper: "hero =
   12, then 3 stat tiles = 4+4+4, then a table = 12." Decide how it stacks on mobile.
5. **Apply spacing from the scale.** Consistent gaps between groups (big), smaller gaps inside
   groups. Let it breathe.
6. **Now, and only now, add the minimum styling.** One accent color, tokens only, states
   (loading/empty/error), hover feedback.
7. **Squint test.** Blur it. Is there a clear #1? Do things line up? Is it calm? If not, go back
   to step 2 — the fix is almost never "add more color."

If you follow those 7 steps, you will produce good-looking screens *without needing taste* —
because good design here is a **process**, not a gift.

---

## 9. Worked example — re-thinking YOUR dashboard

Applying the process to the screen in front of you, here's the reasoning (not the code — the
*thinking*):

| What I see | Why it feels bad | How to think about the fix |
|---|---|---|
| Sidebar scrolls, 15 equal items | No attention budget; "Soon" items cost the same as real ones | Demote/collapse "Soon", tighten rhythm, pin logout — so real nav fits on one screen (§5) |
| 6 stat cards, hollow, spread out | Related items pushed to opposite edges; space put *inside* the group | Cluster icon+number+label together; put the empty space on the outside (§4) |
| Every card a different bright color | Color used as decoration, meaning nothing | One accent, or color only for status (§6) |
| Everything the same size/weight | No #1, no hierarchy — the eye has nowhere to land | Decide the hero (the greeting or the totals), make it bigger/bolder; mute the rest (§3) |
| Sidebar blends into content | Same background color | Bug: give the sidebar `surfaceAlt`; a code fix, not design (§7) |
| `?????? ?????` name | Not a design issue at all | Bug: font/encoding — fix in code (§7) |
| Lots of dead space at the bottom | Content doesn't fill the height, no clear structure | Fine for now — an empty state is honest. Don't fill space just to fill it (§4). |

Notice the pattern: **most fixes are about *organizing and ranking*, not about adding visual
flair.** That is what "thinking like a designer" means.

---

## 10. The five questions to ask yourself, forever

Pin these. Ask them on every screen:

1. **What is the #1 thing here?** (If you can't answer, the user can't either.)
2. **What belongs together?** (Group it with proximity, not boxes.)
3. **How many columns?** (Think in the 12-grid; decide how it stacks on mobile.)
4. **Is every value from the scale?** (Spacing, color, radius — tokens only, no random pixels.)
5. **Does the squint test show a clear shape?** (If it's a pile of equal gray boxes, restructure.)

Master these five questions and you will never again stare at a screen not knowing why it looks
"off" — you'll be able to name exactly what's wrong and how to fix it.
