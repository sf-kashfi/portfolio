# Fatemeh Kashfi — Portfolio Design System

## Direction

Warm, precise, and quietly expressive. Preserve the interactive portrait, technical
headline, code-text backdrop, real product screenshots, detailed career history,
recommendations, and case studies. Give the content priority over surface effects.

## Audit findings and refinements

| Finding | Implemented refinement |
| --- | --- |
| Sections, cards, labels, and links had nearly equal raised visual weight | Thin borders, quiet surfaces, minimal elevation, and unboxed section labels |
| Glossy highlights, strong opposing shadows, and repeated gradients competed with content | Removed panel and card gloss; retained expressive treatments primarily in portrait and product previews |
| Large headings and wide containers weakened reading hierarchy | A 1280px content limit, 28–44px section headings, 20–24px card headings, and a 64px hero ceiling |
| Technology tags used incidental repeating colors and hover movement | Neutral, readable 11px tags; color now reflects semantic or section roles |
| All proof points appeared as clickable cards | Compact metric strip with dividers and no decorative hover movement |
| Navigation lacked a current-section state and mobile focus containment | Intersection-based current-location links and a Radix modal navigation panel |
| Input errors lacked associated descriptions and contaminated implicit field names | Explicit labels, stable field IDs, linked errors, invalid states, and live feedback |
| Contact submission implied a delivery mechanism it did not provide | “Compose email,” an explicit email-app explanation, and accurate draft-request feedback |
| Case pages lacked a theme control; expanded-image focus was not explicitly restored | Shared theme toggle and restoration to the originating screenshot button |
| Animation preferences were applied inconsistently | Shared reduced-motion configuration, immediate reduced-motion reveals, and existing canvas-specific preference handling |

## Tokens

All theme values live in `app/globals.css`; Tailwind exposes the shared canvas,
surface, foreground, muted, brand, secondary, border, and destructive colors.

- **Light:** warm paper canvas `#efede8`, ivory surface `#fcfaf6`, ink `#28312f`.
- **Dark:** charcoal-green canvas `#151a19`, elevated surface `#1e2523`, ivory text `#f1f1e9`.
- **Primary:** deep teal in light mode, soft sage in dark mode. Reserved for primary actions, navigation state, focus, and selected technical details.
- **Secondary:** muted lavender for complementary identity and engineering details.
- **Supporting accents:** warm terracotta, ochre, and blue; semantic success, warning, error, and information tokens are defined separately.
- **Surfaces:** neutral cards; subtle lavender career, warm profile, and mint contact sections. Product previews retain their own identity.
- **Depth:** small single-direction shadows. Borders and surface differences carry most of the hierarchy.

## Typography and layout

- Geist Sans for content, Geist Mono for compact technical metadata.
- Body: 15–16px with comfortable line height; supporting tags: 11px.
- Readable prose measure: 65 characters.
- Spacing: 4px base; 8, 12, 16, 20, 24, 32, 40, 48, and 64px rhythm.
- Fluid section padding: 32–64px. Cards: 20–28px.
- Radii: 6px tags, 10px controls, 18px cards, 24px section panels.
- Existing breakpoints: 360, 640, 960, 1100, and 1280px; hero composition changes at 768px.
- Project dialogs use inset mobile sheets and centered desktop panels; image galleries retain their responsive layouts and keyboard controls.

## Interaction and accessibility

- Primary controls use solid color; supporting actions use borders; case-study links are lightweight text actions.
- Controls retain 44px minimum targets and visible focus outlines.
- Restrained hover feedback; static information is not styled as a moving control.
- Skip links on the portfolio and case pages.
- Radix handles modal semantics, Escape, focus containment, and scroll locking.
- Active sections expose `aria-current="location"`.
- Fields expose required and invalid states and associated error messages.
- Gallery navigation announces the image position and restores opener focus.
- Motion respects system preferences; the original interactive artwork remains available.

## Architecture

Next.js App Router with server-rendered route and case-study content; client
boundaries contain interactive portfolio behavior, galleries, theme controls,
and canvas effects. Existing Radix, React Hook Form, Zod, Framer Motion, GSAP,
Tailwind, and Lucide dependencies are reused. No new runtime dependency is needed.

## Validation

- `npm run lint`, `npm run typecheck`, `npm run test:gallery`, and `npm run build` completed successfully.
- Chromium/Edge automation checked the homepage at 320, 360, 390, 640, 768, 960, 1100, 1440, and 1920px in both themes.
- All five case-study routes were checked at 320, 390, 768, and 1440px in both themes; no page overflow or clipped headings and controls was detected.
- Verified modal focus containment, Escape, menu focus restoration, active section tracking, required-field errors, email-draft feedback, accordion keyboard navigation, lightbox navigation, and screenshot-opener focus restoration.
- Normal-motion touch/mobile and desktop contexts also verified portrait keyboard reactions, theme switching, and the non-Iranian location/résumé variant.
- Axe Core reported no WCAG A/AA violations in the tested homepage, menu, error, dialog, case-study, and lightbox states. No browser runtime errors were recorded in the completed checks.
- Screenshot files were captured during exploration, but image inspection is unavailable in this environment. Browser geometry, accessibility automation, and source review do not replace a final human visual review.
