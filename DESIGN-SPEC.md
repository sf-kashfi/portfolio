# Fatemeh Kashfi — Portfolio Design Specification

## Reference audit

### Reference 1
- Layout: long-form one-page portfolio with desktop and narrow mobile compositions.
- Hierarchy: illustration-led hero, orange calls to action, compact card grids.
- Components: pill buttons, soft cards, skill bars, project thumbnails.
- Motion: floating technology badges, scroll reveals, hover elevation.

### Reference 2
- Layout: modular composition with a wide hero and paired landscape sections.
- Hierarchy: strong hero statement, technology rail, visual section snapshots.
- Components: rounded panels, outlined buttons, portrait frame, timeline cards.
- Motion: orbiting marks, carousel patterns, ambient particles.

### Reference 3
- Layout: editorial landing page with clear desktop/mobile parity.
- Hierarchy: oversized headline, dark primary calls to action, balanced copy and art.
- Components: tinted feature cards, stat blocks, reviews, compact forms.
- Motion: restrained decorative paths and section reveals.

## Design direction

The references are approachable but visually template-like. This portfolio keeps their clarity, modularity, warmth, and mobile discipline while replacing avatar-led decoration with an editorial enterprise aesthetic that makes Fatemeh's engineering depth the visual story.

## Design system

- Character: precise, assured, technical, warm.
- Surfaces: layered near-black graphite in dark mode and warm off-white in light mode.
- Shape: 16–28px radii for major surfaces; compact 10–14px controls; thin borders.
- Depth: restrained translucent surfaces, subtle inner highlights, low-opacity cyan glows.
- Spacing: 4px base; primary rhythm 8, 12, 16, 24, 32, 48, 64, 96, 128.

## Color system

- Dark canvas: `#070A0F`; elevated: `#0D121A`; card: `#111823`.
- Light canvas: `#F5F7F4`; elevated: `#FFFFFF`; card: `#F0F3EF`.
- Primary: teal `#53E0D1`; secondary: coral `#FF8A7A`; highlight: amber `#F4C95D`.
- Text: high-contrast foreground plus two muted tiers.
- Semantic states meet WCAG AA; focus rings use primary with an offset.
- Gradients blend teal into blue-violet at low saturation; coral is reserved for emphasis.

## Typography

- Display and body: Geist Sans, with system fallbacks.
- Technical labels: Geist Mono.
- Display scale: clamp-based 56–104px.
- H2: 40–72px; H3: 24–36px; body large: 18–22px; body: 15–18px; label: 12–14px.
- Tight display tracking and comfortable 1.6 body line-height.

## Grid and layout

- Max content width: 1440px; readable copy width: 680px.
- Twelve-column desktop grid; six columns on tablet; four columns on mobile.
- Main sections use 96–160px vertical spacing and asymmetric editorial compositions.
- Ultrawide displays retain readable measure while ambient artwork expands.

## Component library

- Floating navigation with active-section state and theme toggle.
- Buttons: solid primary, bordered secondary, magnetic hover on precise pointers.
- Bento capability cards, metric tiles, timeline entries, technology chips.
- Project cards with confidential badges, gallery-ready data model, and case-study dialogs.
- Accessible dialog, form fields, tooltip, accordion, and reduced-motion variants.

## Animation principles

- Motion communicates hierarchy and causality; it never blocks content.
- Entrances: 350–600ms with small translate and opacity changes.
- Stagger: 40–80ms; hover feedback: 120–220ms.
- Ambient gradients move slowly and pause for reduced-motion users.
- No scroll-jacking. Parallax is shallow and pointer effects are disabled on touch.

## Responsive strategy

- Content order remains semantic across breakpoints.
- Navigation becomes a compact accessible menu.
- Bento layouts collapse by priority, not merely source order.
- Timeline becomes a single rail; project dialogs become full-screen sheets.
- Fluid type and spacing avoid abrupt jumps; fixed aspect ratios prevent layout shift.

## Information architecture

1. Hero: positioning, availability, core proof points, primary actions.
2. Selected systems: case-study entry points focused on complexity and impact.
3. Experience: reverse-chronological career timeline.
4. Engineering practice: architecture, frontend, UI/UX, testing, and delivery.
5. Technology system: categorized stack.
6. Profile: about, education, languages, and interests.
7. Testimonials: clearly labeled placeholder pending verified quotes.
8. Contact: low-friction email form and direct channels.
9. Footer: resume, profiles, location, and navigation.

