---
name: Chord Map
description: Chord progression explorer powered by graph theory and Circle of Fifths
colors:
  ink: "#0a0912"
  ink-soft: "#100e1c"
  surface: "#15121f"
  surface-hi: "#1e1a30"
  surface-line: "#2a2440"
  violet: "#7c5cfc"
  violet-dim: "#6947e0"
  violet-soft: "#a78bfa"
  cyan: "#22d3ee"
  amber: "#f5a524"
  rose: "#fb7185"
  mint: "#34d399"
  ink-100: "#f4f2fb"
  ink-200: "#ddd7f0"
  ink-300: "#c7c1e0"
  ink-500: "#8c85ad"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.1
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontWeight: 400
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.ink-100}"
    rounded: "{rounded.full}"
    padding: "16px 48px"
    fontWeight: 600
  button-primary-hover:
    backgroundColor: "{colors.violet-dim}"
    textColor: "{colors.ink-100}"
    rounded: "{rounded.full}"
    padding: "16px 48px"
    fontWeight: 600
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-300}"
    rounded: "{rounded.full}"
    padding: "16px 48px"
    border: "1px solid {colors.surface-line}"
    fontWeight: 600
  button-secondary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.cyan}"
    rounded: "{rounded.full}"
    padding: "16px 48px"
    border: "1px solid {colors.cyan}"
    fontWeight: 600
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-100}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.surface-line}"
    padding: "24px"
  card-elevated:
    backgroundColor: "{colors.surface-hi}"
    textColor: "{colors.ink-100}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.surface-line}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-100}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.surface-line}"
    padding: "10px 12px"
  input-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-100}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.violet-soft}"
    padding: "10px 12px"
  chip:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.ink-100}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
    fontSize: "14px"
    fontWeight: 500
---

# Design System: Chord Map

## 1. Overview

**Creative North Star: "The Harmonic Cosmos"**

Chord Map exists in abstract harmonic space — a dark void where chord relationships become visible geometry. Nodes float like celestial bodies; transitions glow like gravitational pulls. The design draws from astronomical visualization: controlled darkness punctuated by precise, luminous accents. This is not a music production tool or a music notation app. It is a map, and maps work best when the terrain is legible against the background.

The palette is built on two forces: **gravity** (violet — the tonic, home, resolution) and **tension** (cyan — the dominant, movement, energy). Amber, rose, and mint appear as tertiary signals — genre context, alerts, success states — but never compete with the primary axis. The dark ink background is not just aesthetic; it is the canvas on which the graph becomes legible.

**Key Characteristics:**
- Dark cosmic void with controlled luminous accents
- Violet as gravity/home, cyan as tension/movement
- Generative Three.js hero sets the creative tone; functional pages stay focused
- Tonal layering instead of shadows — no depth on flat surfaces
- Typography mixes Space Grotesk (geometric confidence) with Inter (readable body) and JetBrains Mono (technical labels)

**The Gravity Rule.** Violet appears where the user should feel settled — home chords, primary actions, active states. Its use is earned, not ambient.

**The Tension Rule.** Cyan appears where there is forward motion — secondary actions, hover states, data accents. It never dominates a full surface; it highlights what moves.

## 2. Colors

The palette is a dark cosmos: near-black purple backgrounds with saturated violet and cyan accents. Tertiary colors (amber, rose, mint) appear as signal colors for genre context, alerts, and success states.

### Primary

- **Gravity Violet** (#7c5cfc): The primary accent. Home, resolution, the tonic chord. Used for primary buttons, active nav states, and the key chromatic anchor. Saturated enough to glow against the dark background without screaming.
- **Gravity Violet Dim** (#6947e0): The hover/gradient-end state for violet. Slightly darker, maintaining warmth but reducing intensity on interaction.
- **Gravity Violet Soft** (#a78bfa): The muted violet for secondary text accents and hover borders. Light enough to read as a soft glow, not a hard edge.

### Secondary

- **Tension Cyan** (#22d3ee): The counterweight to violet. Used sparingly — secondary actions, hover accents on secondary elements, data visualization on the chord graph. Communicates movement and exploration.
- **Amber** (#f5a524): Tertiary signal. Genre context, warm highlights, occasional accent on functional UI. Not a primary accent.
- **Rose** (#fb7185): Tertiary signal. Genre context, alerts, error-adjacent states.
- **Mint** (#34d399): Tertiary signal. Success states, positive confirmation, genre context.

### Neutral

- **Void Ink** (#0a0912): The background. Not pure black — a deep purple-black that suggests depth without coldness. The darkest surface.
- **Ink Soft** (#100e1c): Secondary dark. Subtle elevation step above void ink.
- **Surface** (#15121f): Cards, panels, elevated containers. The primary working surface.
- **Surface Hi** (#1e1a30): Higher elevation. Hover states on cards, expanded panels.
- **Surface Line** (#2a2440): Borders, dividers, separators. Visible but not distracting.
- **Ink 100** (#f4f2fb): Primary text. High contrast against the dark background.
- **Ink 200** (#ddd7f0): Secondary text. Slightly muted, readable.
- **Ink 300** (#c7c1e0): Tertiary text. Labels, descriptions.
- **Ink 500** (#8c85ad): Muted text. Placeholders, disabled states.

**The One-Tenth Rule.** Cyan, amber, rose, and mint together occupy ≤10% of any given screen. Their rarity is the point — when they appear, they signal something specific.

## 3. Typography

**Display Font:** Space Grotesk (ui-sans-serif fallback)
**Body Font:** Inter (ui-sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (ui-monospace, Menlo fallback)
**Decorative:** Press Start 2P — used sparingly for retro/tech nods; never in functional UI

**Character:** Geometric confidence meets readable clarity. Space Grotesk brings sharp, modern personality to headings and navigation. Inter keeps body text comfortable for extended reading. JetBrains Mono grounds technical labels (Roman numerals, chord symbols, mode indicators) in monospace precision.

### Hierarchy

- **Display** (Space Grotesk, 700, clamp(3rem, 8vw, 5rem), 1.1): Hero headlines only. The Shuffle animation component uses this for the landing page title.
- **Headline** (Space Grotesk, 600, 1.875rem, 1.2): Section titles, page headers. The Panel component titles use this.
- **Title** (Space Grotesk, 500, 1.125rem, 1.3): Card titles, feature headings within sections.
- **Body** (Inter, 400, 1rem, 1.6): Descriptions, explanatory text. Max line length 65ch for comfortable reading.
- **Label** (JetBrains Mono, 400, 0.875rem, 1.5): Technical identifiers — chord symbols (I, V, vi), genre keys (pop, jazz), mode indicators. Always letter-spaced slightly.

**The Mono Label Rule.** Chord symbols, Roman numerals, and musical notation always use JetBrains Mono. Mixing serif or sans-serif for musical notation breaks the technical precision the tool projects.

## 4. Elevation

**No shadows.** Depth is conveyed entirely through tonal layering — the surface hierarchy (ink → ink-soft → surface → surface-hi → surface-line) creates separation without shadows. This matches the "constellation atlas" metaphor: celestial bodies float at different distances, but they don't cast shadows.

The background is the void. Cards and panels float above it by being slightly lighter. Borders appear at transition points. There is no box-shadow vocabulary; if something needs to feel elevated, it becomes surface-hi.

### The Flat-By-Default Rule

Surfaces are flat at rest. The only "shadow" behavior is the glow effect on primary buttons (`box-shadow: 0 0 40px rgba(124,92,252,0.5)`), which is not elevation — it is luminosity. The violet glow communicates energy, not depth.

### Border Vocabulary

- **Surface Line** (#2a2440): Default borders. Cards, panels, inputs.
- **Violet Soft** (#a78bfa at 30%): Focus borders, hover states on interactive elements.
- **Cyan** (#22d3ee at 50%): Accent borders on hover for secondary elements.

## 5. Components

### Buttons

- **Shape:** Fully rounded (`border-radius: 9999px`). The roundness signals interactivity and approachability — a contrast to the geometric sharpness of the typography.
- **Primary:** Background gradient from violet to violet-dim. White text. Glowing box-shadow on hover. Padding 16px 48px.
- **Primary Hover:** Slightly darker gradient. Scale transform on hover (`scale: 1.01-1.05`). Glow intensifies.
- **Secondary:** Transparent background. Border 1px surface-line. Text ink-300. Hover: border transitions to cyan, text becomes cyan.
- **Disabled:** Opacity reduced to 40%. No hover effect. Cursor: not-allowed.

### Cards

- **Corner Style:** Large rounded corners (16px)
- **Background:** Surface (#15121f)
- **Border:** 1px surface-line
- **Shadow Strategy:** None. Tonal elevation only.
- **Internal Padding:** 24px
- **Hover State:** Background transitions to surface-hi. Border transitions to violet-soft at 50% opacity. Subtle translateY(-4px) lift.

### Inputs

- **Style:** Solid background (surface), 1px border (surface-line), medium rounded corners (8px).
- **Focus:** Border transitions to violet-soft. No glow or box-shadow.
- **Disabled:** Opacity reduced. Cursor: not-allowed.
- **Text:** Ink-100 for value, ink-500 for placeholder.

### Navigation

- **Style:** Fixed top header. Backdrop blur (backdrop-filter: blur(16px)). Semi-transparent background (85% opacity).
- **Typography:** Space Grotesk, medium weight, 14px. Ink-300 default, ink-100 active.
- **Default State:** Text only, no background.
- **Active State:** Gradient background (violet to violet-dim) behind the nav item. Box-shadow glow.
- **Mobile:** Hamburger menu with animated bars. Full-width dropdown with rounded items.

### Panel Component

- **Signature component** for this project. Used throughout the tool to group related controls.
- **Corner Style:** Large rounded corners (16px)
- **Background:** Surface (#15121f)
- **Border:** 1px surface-line
- **Internal Structure:** Title row (icon + text) with border-bottom separator, then content area with consistent padding.

### Progression Chain

- **Signature component** for displaying generated chord sequences.
- **Horizontal layout** with chord nodes connected by edges.
- **Active state:** Currently playing chord highlighted with violet glow.
- **Clickable:** Each chord can be clicked to play individually.

### Genre Buttons

- **Grid of selectable genre options** with emoji indicators.
- **Selected:** Violet background, violet glow.
- **Unselected:** Surface background, surface-line border.
- **Hover:** Border transitions to cyan.

## 6. Do's and Don'ts

### Do:

- **Do** use violet as the primary action color — it signals home, resolution, primary flow. Let it breathe; don't saturate the page with it.
- **Do** use cyan for secondary actions and hover states on non-primary elements — it signals movement and exploration.
- **Do** keep functional pages focused. The Three.js hero is for the landing page. Don't repeat the visual drama on every route.
- **Do** use JetBrains Mono for all musical notation (Roman numerals, chord symbols, genre keys).
- **Do** use tonal layering for depth — surface-hi on hover, surface for resting state.
- **Do** use the full rounded button shape — it signals approachability against the dark geometric backdrop.
- **Do** maintain WCAG A contrast ratios. Ink-100 on ink background exceeds 15:1. Check ink-300 in small text.

### Don't:

- **Don't** use violet or cyan as decorative fills on non-interactive elements. They are signal colors, not palette decoration.
- **Don't** add shadows. The tonal layer IS the depth system. Shadows break the flat cosmic metaphor.
- **Don't** use border-left or border-right as colored accent stripes on cards or list items. Use background tints or leading indicators instead.
- **Don't** use gradient text (background-clip: text) for headings or emphasis. Use a solid color.
- **Don't** repeat the hero's Three.js canvas on sub-pages. One dramatic entrance, then focused functionality.
- **Don't** use Press Start 2P for functional UI text. It is decorative only.
- **Don't** create card grids with identical-sized cards and identical content patterns. Vary the density — some cards can hold more, some less.
- **Don't** use generic AI-generated UI patterns — the dark purple gradient with glowing accents is owned and deliberate. If it looks like a template, rework it.
