---
timestamp: 2026-07-15T19-17-37Z
slug: generator-builder-explorer-referensi-pages
---
# Generator, Builder, Explorer, Referensi pages — Design Critique

**Total score: 25/40 (Acceptable)**

## AI Slop Verdict: PASS
Dark cosmic void with violet/cyan is genuinely owned. No template patterns. Tonal elevation system is disciplined.

## Heuristic Scores
| H | Score | Key Issue |
|---|-------|-----------|
| H1 Visibility of System Status | 3 | Explorer selected-node not indicated outside canvas |
| H2 Match System and Real World | 3 | Bahasa/English mix in Builder actions |
| H3 User Control and Freedom | 2 | No confirmation on "Gunakan di Generator"; bar count silently clamps; no keyboard shortcuts |
| H4 Consistency and Standards | 2 | SpecularButton is WebGL shader vs. spec's gradient buttons; literal shadows violate no-shadows rule |
| H5 Error Prevention | 2 | Bar count silently rejects out-of-range; no clipboard error feedback; Reset has no confirmation |
| H6 Recognition Rather Than Recall | 3 | Domain terms accurate; amber/star distinction requires hover tooltip |
| H7 Flexibility and Efficiency | 3 | 3 modes, key switching; no keyboard nav on graph, no zoom |
| H8 Aesthetic and Minimalist Design | 3 | Cohesive void aesthetic; SpecularButton violates design spec entirely |
| H9 Error Recovery | 2 | No toast/notification system; no error boundary; clipboard uses alert() |
| H10 Help and Documentation | 2 | Reference page useful; no onboarding, no tooltips, no help modal |

## Priority Issues

### P0
1. Builder: No keyboard navigation on chord slots or suggestion buttons (hard accessibility block)
2. SpecularButton ignores design system + no reduced-motion support

### P1
3. Builder "Gunakan di Generator" navigates away without confirmation
4. Generator bar count silently clamps out-of-range values
5. Explorer chord graph: no keyboard traversal, no zoom
6. Builder Reset has no confirmation dialog

### P2
7. Generator eyebrow mixes English with Indonesian interface
8. Reference page content order is backwards for learning
9. No shared toast/notification system
10. Builder TipCard component is dead code

## Cognitive Load: MODERATE
- Builder: 7 simultaneous UI groups before first action
- Builder state jumps abruptly between initial/suggestion/complete states
- Explorer: node labels only visible on hover/click

## Strengths
1. Chord graph canvas is genuinely excellent functional design
2. Builder's audio-on-select is superb sensory feedback
3. GenreSidebar as persistent navigation is architecturally right

## Persona Red Flags
- Alex: No keyboard nav on Builder or Explorer → immediate abandonment
- Jordan: Recommendation rationale only on hover → core value hidden for touch/keyboard users
- Sam: Builder chord buttons have no ARIA roles; GenreSidebar animation is pointer-only

## Minor Observations
- SpecularButton canvas consumes render budget per instance
- BUILDER_KEY hardcoded to 'C' — asymmetry with Generator/Explorer
- PopularProgressionCards shares isPlaying state with Generator — audio conflict possible
- No error boundaries; malformed graph data crashes Explorer
- Reference page has no "Try this in Generator" CTA

## Provocative Questions
1. Is the WebGL SpecularButton worth the maintenance cost vs. CSS gradient+box-shadow?
2. Should Reference page lead with action (Popular Progressions) or foundation (Roman Numerals)?
3. Should Builder be a multi-step wizard to reduce the 7-group simultaneous cognitive load?
