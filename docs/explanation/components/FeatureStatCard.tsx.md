# `components/FeatureStatCard.tsx` — the gradient "hero" KPI card

## What it is

A fancier version of `StatCard` for the **headline** dashboard numbers. It has a coloured
gradient background, a frosted icon badge in the top-left corner, the big number + label
clustered at the bottom, and — the key trick — a **backlight glow**: a blurred copy of the same
gradient sitting *behind* the card so it looks like it's glowing on the dark page.

Think of it like a Blade partial (`@include('cards.hero-stat', [...])`) that you drop in with a
few props. `StatCard` is the plain partial; this is the "featured" one.

## The props

```tsx
FeatureStatCard({ label, value, icon, tint, loading })
```

- `label` — the caption (e.g. "Cars").
- `value` — the number to show big.
- `icon` — a react-icon element (e.g. `<MdOutlineDirectionsCar />`).
- `tint` — **one** hex colour (e.g. `"#3B6FE0"`). Every layer — the colour wash, the glow, the
  border, the icon badge — is derived from this single colour at **low opacity**. That's the
  trick to keeping it soft/pale and easy on the eyes: we never paint the tint at full strength,
  we always fade it into the dark card. A tiny helper `rgba(hex, alpha)` builds those faded
  versions.
- `loading` — when `true`, shows a grey skeleton bar instead of the number (while the API call
  is still running).

## Why it's a soft dark card, not a bright one

An earlier version filled the whole card with a bright, saturated gradient — it looked harsh on
a dark screen. The fix wasn't a different colour, it was **less** colour: the card is now a dark
`surface` card with the tint applied only as a faint wash (max ~40% opacity, fading to nothing).
Same idea as the "restraint" rule — colour should whisper, not shout. The card is also a **true
square** (`aspectRatio={1}`) as requested.

## How the "backlighting" works (three stacked layers)

A screen element can have layers stacked on top of each other using `position="absolute"` +
`zIndex`. This card uses three:

1. **The glow (behind, `zIndex={0}`)** — a `Box` with the same gradient, pushed down a little
   (`transform="translateY(14px)"`), shrunk slightly, and **blurred** (`filter: blur(22px)`).
   Blur + colour = a soft halo. Because it sits behind the real card and leaks out the bottom,
   the card looks like it's lit from behind. This is the effect you asked for.
2. **The card (`zIndex={1}`)** — the actual gradient box with the content. `overflow="hidden"`
   clips its inner layer to the rounded corners.
3. **The gloss (inside the card)** — a `radial-gradient` of faint white in the top-left corner.
   This fakes a light source hitting the card, giving it a glassy, 3D feel instead of a flat
   fill.

The icon badge uses `backdropFilter: blur(6px)` + a semi-transparent white background
(`whiteAlpha.300`) — that's the "frosted glass" look, where you can slightly see the gradient
through the badge.

## Why the value + label sit together at the bottom

Earlier we learned: **empty space belongs on the *outside* of a group, not inside it.** The
icon is anchored to the top, the number + label are clustered at the bottom as one unit, and the
space in between is the card's breathing room. `justify="space-between"` here is correct because
it's separating two *different* groups (icon vs. the value block), not spreading apart items that
belong together.

## When you'll touch this file

- To change the glow strength: the `opacity` / `blur` on the glow `Box`.
- To make the cards taller/shorter (closer to a perfect square): the `minH` on the card `Flex`.
- To add a "% change" chip like the reference dashboard: add an optional `delta` prop and render
  a small `Badge` next to the value (copy the pattern from `StatCard`).

Used by `features/dashboard/DashboardHome.tsx` for the first four metrics.
