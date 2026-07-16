# Product

## Register

product

## Platform

web

## Users

**Primary:** Musicians and composers who want to generate, explore, and understand chord progressions — from hobbyists writing their first song to producers looking for inspiration. They're in a creative flow, not reading documentation.

**Secondary:** Music students and theory learners who want to visualize how chords relate to each other, understand why certain progressions "work," and build intuition through interactive exploration.

Both share the same underlying need: to make sense of harmony through sight, not just sound.

## Product Purpose

Chord Map treats chord progressions as a graph problem. Every chord is a node, every transition is an edge weighted by how often that movement appears in real music. This makes the invisible relationships between chords visible — letting musicians explore intuitively, generate confidently, and learn naturally.

The tool succeeds when a user:
- Generates a progression in under 10 seconds
- Understands *why* that progression sounds the way it does
- Feels encouraged to explore further rather than copy-pasting and leaving

## Positioning

The only chord tool that makes the Circle of Fifths *feel* like a map — not a chart. You don't just see chord relationships, you navigate them.

## Brand Personality

**Welcoming & encouraging.** Music theory can feel intimidating or academic. Chord Map is the opposite: it invites exploration without judgment. A beginner should feel like a producer; an expert should feel like they have a new perspective.

Tone is:
- Clear, not technical — "this chord resolves nicely" not "half-diminished substitution theory"
- Confident, not overwhelming — suggest, don't lecture
- Playful without being childish — the emoji help, they don't replace words

## Anti-references

- **Generic AI-generated UIs.** The dark purple gradient with glowing accents is deliberate and owned. Slop tools look washed-out and interchangeable. Chord Map has visual identity, not decoration.
- **DAW-complexity.** This is not a synthesizer or production suite. Complexity is earned, not assumed. Every feature should feel discoverable.
- **Pixel-art-by-default.** The Press Start 2P font is a nod to generative/maker culture, not a mandate. The functional interface uses Space Grotesk.

## Design Principles

1. **Show the graph.** Every feature should connect back to the underlying chord graph. Generation, building, exploration, and theory should all feel like different views of the same map.

2. **Learn by doing.** Users don't read theory then apply it — they generate, hear, explore, and *then* understand. Theory reference supports exploration, not the other way around.

3. **Confident defaults.** Pre-select sensible options. Start with a progression, not a blank page. The first chord is always the right place to begin.

4. **Invitation, not instruction.** Guide without gatekeeping. "Try this next" is better than "you must."

5. **Earn the Three.js.** The generative art hero sets the creative tone. Functional pages stay focused — the drama is reserved for the landing, not repeated on every route.

## Accessibility & Inclusion

- **WCAG A compliance** as the baseline target
- Keyboard navigation throughout (focus states already implemented)
- Color contrast ratios ≥4.5:1 for text, ≥3:1 for large/UI elements
- Reduced motion support (`prefers-reduced-motion` respected)
- Indonesian language interface — keep labels and instructions in Bahasa Indonesia, simple and direct
