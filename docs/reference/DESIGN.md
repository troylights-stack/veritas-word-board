---
version: alpha
name: Veritas — Daylight & Nightspell
description: A tactile magical true-false sorting board with equivalent light and dark themes.
colors:
  primary: "#9560E8"
  secondary: "#75E3C3"
  tertiary: "#F2C66D"
  neutral: "#19152E"
  light-canvas: "#F7F0E5"
  light-panel: "#FFF9F0"
  light-raised: "#FFFCF7"
  light-inset: "#F4EBDD"
  light-text: "#243F40"
  light-text-muted: "#675B70"
  light-border: "#C99F77"
  light-control-border: "#947354"
  light-highlight: "#FFFFFF"
  light-primary: "#58C8C3"
  light-primary-hover: "#70D7CE"
  light-primary-edge: "#247F7C"
  light-on-primary: "#243F40"
  light-true: "#26786B"
  light-true-surface: "#DCF3E8"
  light-false: "#A54335"
  light-false-surface: "#FFE4D7"
  light-unsorted: "#806018"
  light-unsorted-surface: "#FFF0C8"
  light-gold: "#E8B74F"
  light-focus: "#26786B"
  light-error: "#A12F3D"
  light-error-surface: "#FCE8E7"
  light-disabled: "#E5DED2"
  light-disabled-text: "#766F69"
  dark-canvas: "#19152E"
  dark-panel: "#302344"
  dark-raised: "#44315D"
  dark-inset: "#211A34"
  dark-text: "#F5EBDD"
  dark-text-muted: "#C4B5D3"
  dark-border: "#715587"
  dark-control-border: "#AA89C4"
  dark-highlight: "#C5A3FF"
  dark-primary: "#9560E8"
  dark-primary-hover: "#9B66EB"
  dark-primary-edge: "#633898"
  dark-primary-compact: "#7445B8"
  dark-on-primary: "#F5EBDD"
  dark-true: "#75E3C3"
  dark-true-surface: "#253D49"
  dark-false: "#C5A3FF"
  dark-false-surface: "#39264F"
  dark-unsorted: "#F2C66D"
  dark-unsorted-surface: "#3D3143"
  dark-gold: "#F2C66D"
  dark-focus: "#75E3C3"
  dark-error: "#FFB4BE"
  dark-error-surface: "#482B43"
  dark-disabled: "#3A304C"
  dark-disabled-text: "#A394B3"
typography:
  brand:
    fontFamily: "Fredoka, Trebuchet MS, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  heading:
    fontFamily: "Fredoka, Trebuchet MS, sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.2
  zone-heading:
    fontFamily: "Nunito Sans, Trebuchet MS, sans-serif"
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: 0.02em
  body:
    fontFamily: "Nunito Sans, Trebuchet MS, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  card:
    fontFamily: "Nunito Sans, Trebuchet MS, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.45
  label:
    fontFamily: "Nunito Sans, Trebuchet MS, sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.4
  button:
    fontFamily: "Nunito Sans, Trebuchet MS, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.25
  button-primary:
    fontFamily: "Nunito Sans, Trebuchet MS, sans-serif"
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.25
  caption:
    fontFamily: "Nunito Sans, Trebuchet MS, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  input:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
rounded:
  xs: 4px
  sm: 8px
  input: 12px
  card: 14px
  panel: 20px
  modal: 24px
  full: 9999px
spacing:
  hairline: 1px
  edge: 2px
  micro: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  card-gap: 12px
  page-desktop: 32px
  page-tablet: 24px
  page-mobile: 16px
  content-max: 1440px
  stdin-width: 320px
  stdin-rail: 56px
  touch-target: 44px
  control-height: 44px
  primary-height: 52px
components:
  panel-light:
    backgroundColor: "{colors.light-panel}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.panel}"
    padding: "{spacing.lg}"
  panel-dark:
    backgroundColor: "{colors.dark-panel}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.panel}"
    padding: "{spacing.lg}"
  card-light:
    backgroundColor: "{colors.light-raised}"
    textColor: "{colors.light-text}"
    typography: "{typography.card}"
    rounded: "{rounded.card}"
    padding: "{spacing.md}"
  card-dark:
    backgroundColor: "{colors.dark-raised}"
    textColor: "{colors.dark-text}"
    typography: "{typography.card}"
    rounded: "{rounded.card}"
    padding: "{spacing.md}"
  button-primary-light:
    backgroundColor: "{colors.light-primary}"
    textColor: "{colors.light-on-primary}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.full}"
    height: "{spacing.primary-height}"
    padding: "{spacing.md}"
  button-primary-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.full}"
    height: "{spacing.primary-height}"
    padding: "{spacing.md}"
  button-primary-light-hover:
    backgroundColor: "{colors.light-primary-hover}"
  button-primary-dark-hover:
    backgroundColor: "{colors.dark-primary-hover}"
  button-primary-dark-compact:
    backgroundColor: "{colors.dark-primary-compact}"
    textColor: "{colors.dark-on-primary}"
    typography: "{typography.button}"
    height: "{spacing.control-height}"
    rounded: "{rounded.full}"
  button-secondary-light:
    backgroundColor: "{colors.light-inset}"
    textColor: "{colors.light-text}"
    typography: "{typography.button}"
    height: "{spacing.control-height}"
    rounded: "{rounded.full}"
  button-secondary-dark:
    backgroundColor: "{colors.dark-raised}"
    textColor: "{colors.dark-text}"
    typography: "{typography.button}"
    height: "{spacing.control-height}"
    rounded: "{rounded.full}"
  input-light:
    backgroundColor: "{colors.light-inset}"
    textColor: "{colors.light-text}"
    typography: "{typography.input}"
    rounded: "{rounded.input}"
    padding: "{spacing.md}"
  input-dark:
    backgroundColor: "{colors.dark-inset}"
    textColor: "{colors.dark-text}"
    typography: "{typography.input}"
    rounded: "{rounded.input}"
    padding: "{spacing.md}"
  button-disabled-light:
    backgroundColor: "{colors.light-disabled}"
    textColor: "{colors.light-disabled-text}"
  button-disabled-dark:
    backgroundColor: "{colors.dark-disabled}"
    textColor: "{colors.dark-disabled-text}"
  modal-light:
    backgroundColor: "{colors.light-panel}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.modal}"
    padding: "{spacing.lg}"
  modal-dark:
    backgroundColor: "{colors.dark-panel}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.modal}"
    padding: "{spacing.lg}"
---

# Veritas — DESIGN.md

> **How to read this file.** This is the design system the board was built from: tokens, both themes, components, and rules. The shipped build follows it, with deliberate changes decided while building. Those changes win where they conflict; see [SPEC.md](SPEC.md#differences-from-designmd) for the list. The reference mockups mentioned below are in [`docs/mockups/`](mockups/).

## Overview

Veritas is a statement-sorting workspace: paste lines into `stdin`, cast cards, assign TRUE or FALSE, and review the answers. It combines a clear productivity layout with soft, tactile casual-game styling and a small friendly cat wizard. The product interface is English.

**Two complete themes are required:** **Daylight** (the first cream reference) and **Nightspell** (the second dark-purple reference). They are two visual modes of one design system, not separate layouts or products. Both must support every component, state, interaction, and breakpoint.

Sources and authority:

- The supplied `spec(2).md` defines the **DESIGN.md file format**, not the product behavior. This document follows its YAML schema and eight ordered markdown sections.
- The two generated mockups establish composition, material character, and mascot direction. The user's original board requirements establish behavior.
- The user's explicit dark hex values are normative. Light-theme values, fonts, measurements, elevation, and responsive rules below are implementation choices inferred from the visual references, not pixel measurements or identified source fonts.
- Typed tokens are authoritative when a rendered image differs. Intentional refinements include legible button labels, accessible targets, a theme selector, and a properly docked console.
- Demo statements and the `4/8 sorted` state illustrate the design only. A new session starts with an empty input and board. Do not hard-code screenshots' counts or copy.

The mood is warm, curious, and quietly magical. Use material edges, restrained highlights, and rounded typography. Keep the working surface immediately usable; do not add a marketing hero, ornamental castle, or dense fantasy scenery.

## Colors

### Theme model and token resolution

The file format has no defined `themes` field. Keep `colors` flat using `light-*` and `dark-*` keys. Do not invent a nested theme schema. Component variants use explicit suffixes, such as `card-light` and `card-dark`.

The unprefixed `primary`, `secondary`, `tertiary`, and `neutral` entries describe the default Nightspell palette for generic consumers. **They are not runtime aliases that change automatically.** Application components must resolve the active theme through the mapping below.

Set `data-theme="light"` or `data-theme="dark"` on the document root, then map semantic CSS variables to the corresponding prefixed tokens. Implement selectors for both modes. Never implement light mode by applying a filter, lowering opacity, or inverting the dark UI.

| Semantic role | Daylight token | Nightspell token |
|---|---|---|
| Page background | `light-canvas` | `dark-canvas` |
| Main panels, headers, dialogs | `light-panel` | `dark-panel` |
| Cards and raised controls | `light-raised` | `dark-raised` |
| Textarea and console wells | `light-inset` | `dark-inset` |
| Primary text | `light-text` | `dark-text` |
| Secondary text | `light-text-muted` | `dark-text-muted` |
| Decorative panel rim | `light-border` | `dark-border` |
| Essential input/control outline | `light-control-border` | `dark-control-border` |
| Primary action | `light-primary` | `dark-primary` |
| Primary label | `light-on-primary` | `dark-on-primary` |
| Top highlight | `light-highlight` | `dark-highlight` |
| Bottom button edge | `light-primary-edge` | `dark-primary-edge` |
| Keyboard focus | `light-focus` | `dark-focus` |
| TRUE foreground / tint | `light-true` / `light-true-surface` | `dark-true` / `dark-true-surface` |
| FALSE foreground / tint | `light-false` / `light-false-surface` | `dark-false` / `dark-false-surface` |
| UNSORTED foreground / tint | `light-unsorted` / `light-unsorted-surface` | `dark-unsorted` / `dark-unsorted-surface` |
| Error foreground / tint | `light-error` / `light-error-surface` | `dark-error` / `dark-error-surface` |
| Disabled fill / label | `light-disabled` / `light-disabled-text` | `dark-disabled` / `dark-disabled-text` |

### Palette character

**Daylight:** warm cream canvas, ivory panels, caramel rims, turquoise primary actions, mint TRUE, peach FALSE, and butter-yellow UNSORTED. Text is deep teal or warm muted plum. Large surfaces stay quiet; character and controls carry saturated color.

**Nightspell:** blueberry `#19152E` canvas, plum `#302344` panels, and raised purple `#44315D` cards. Amethyst `#9560E8` actions receive lavender `#C5A3FF` edge highlights. Mint `#75E3C3` marks TRUE and successful activity; gold `#F2C66D` marks small magical details and UNSORTED. Text is cream `#F5EBDD`; secondary copy is lavender `#C4B5D3`. FALSE is lavender, as in the second reference. Operational errors have a separate rose accent and are not synonymous with a FALSE verdict.

Use status tints on zone headers and subtle boundaries. Keep card bodies neutral within each theme. Never rely on color alone: pair each verdict with its label, count, and `[ ]`, `[+]`, or `[-]` symbol.

### Contrast rules

Target at least 4.5:1 for regular text and 3:1 for qualifying large text and essential non-text indicators. Check the actual rendered state, including gradients, hover colors, and overlays; the palette alone is not an accessibility certification.

Calculated examples for solid token pairs:

| Foreground / background | Contrast | Application |
|---|---:|---|
| `dark-text` / `dark-raised` | 9.66:1 | Card text |
| `dark-text-muted` / `dark-raised` | 5.91:1 | Metadata |
| `light-on-primary` / `light-primary` | 5.63:1 | Light primary button |
| `dark-on-primary` / `dark-primary` | 3.48:1 | Large bold primary label only |

The Nightspell `cast` label must remain 20px and weight 800. Its text-bearing area uses the amethyst base; confine bright highlights to edges outside glyphs. For smaller primary buttons, use `button-primary-dark-compact` with its darker fill. Do not put small cream text on the bright amethyst base. Shortcut keycaps on the primary button use a dark inset behind their smaller text. Decorative low-contrast rims must not be the only way to identify an interactive control.

## Typography

Use **Fredoka** for the wordmark and friendly headings, **Nunito Sans** for cards, labels, and body copy, and **IBM Plex Mono** for the terminal, input, numbering, and shortcuts. These are selected implementation families, not claims about which fonts generated the images. Load the actual used weights; retain the provided fallbacks while fonts load.

| Role | Token | Guidance |
|---|---|---|
| Veritas wordmark | `brand` | 40px desktop; 32px on narrow screens |
| Board/dialog title | `heading` | 26px; 22px on narrow screens |
| Zone heading | `zone-heading` | 20px, uppercase TRUE/FALSE/UNSORTED |
| Statement text | `card` | 18px, sentence case; wrap freely |
| Supporting prose | `body` | 16px minimum |
| Regular controls | `button` | 16px bold |
| Main cast action | `button-primary` | 20px extra-bold in both themes |
| Useful labels/counters | `label` | 14px; never reduce to decorative microtype |
| Optional metadata | `caption` | 13px; nonessential content only |
| Commands and card numbers | `mono` | 14px with tabular numeral behavior |
| Textarea | `input` | 16px; avoid mobile input zoom |

Use real text rather than rasterized interface labels. Convert pixel design tokens to equivalent rem values if the codebase uses rem; respect user font settings. Do not shrink text to rescue an undersized container. Allow wraps or change the grid. Decorative outlines or short embossed shadows belong only on the wordmark and a small number of major accents. No glow or stroke on body text.

## Layout

### Shared structure

1. **Header:** sparkle emblem, `veritas — tf-board 1.0`, progress status, and theme selector.
2. **Workspace:** open `stdin` on the left; board toolbar, UNSORTED, then TRUE/FALSE on the right.
3. **Console:** docked at the bottom with bounded history and a command input.
4. **Status strip:** compact readiness and genuine save status, if persistence is implemented.

Use a 4px base rhythm. Standard content padding is 24px, card padding 16px, card gap 12px, and major gutter 24px. Use the named scale rather than arbitrary offsets. Borders and optical alignment may use the 1px and 2px tokens.

### Responsive grid

| Viewport width | Layout |
|---|---|
| 1200px and above | Centered content, max 1440px, 32px outer padding; 320px stdin and `minmax(0, 1fr)` board. UNSORTED cards in two columns; TRUE/FALSE side by side. |
| 900–1199px | 24px outer padding; stdin 280px, flexible board. UNSORTED cards use one column when a card would be narrower than 240px; TRUE/FALSE remain side by side if each can be at least 240px. |
| Below 900px | 16px outer padding; stdin above board, then UNSORTED, TRUE, FALSE in reading order. Cards and verdict zones use one column. |

Collapsed stdin is a 56px vertical rail on desktop and a horizontal strip of at least 44px on mobile. The strip says `open stdin` and includes an expand icon. Collapse the workspace grid itself so the board gains the freed width.

On small screens, header items wrap into purposeful rows. Keep the title, progress, and theme controls readable. Stack input actions if they do not fit. Minimum supported width: 320px, with no page-level horizontal scrolling. Long tokens in statement text wrap with `overflow-wrap: anywhere`; do not truncate the user's statement.

### Console docking and overflow

Prefer an app-height grid with header, a scrolling workspace, console, and status strip. This keeps the console at the bottom without covering cards. If using sticky/fixed docking, reserve its real height in the content layout, including mobile safe-area insets.

Desktop console: approximately 160–200px total height; log scrolls inside its allotted area. Mobile: approximately 120–160px, bounded by available viewport height. When the soft keyboard opens, adapt to the visual viewport so the focused command input stays visible. At short heights or 200% text zoom, allow the page to scroll rather than clipping content. Keep scroll containers clearly scoped; do not trap page scrolling over the board.

The mockups illustrate placement, not fixed dimensions. Console alignment may span the full workspace width to satisfy bottom docking; do not copy screenshot geometry when it obstructs use.

## Elevation & Depth

Use a consistent upper-left light source and three layers: recessed inputs, matte panels, raised cards/actions. The design should resemble carefully made game placards rather than glass panes.

| Layer | Daylight | Nightspell |
|---|---|---|
| Main panel | `0 3px 0 rgba(150,100,54,.16), 0 8px 20px rgba(86,60,42,.08)` | `0 3px 0 rgba(14,9,25,.35), 0 8px 24px rgba(14,9,25,.22)` |
| Card | `0 2px 4px rgba(91,64,39,.12)` | `0 2px 5px rgba(14,9,25,.28)` |
| Inner upper rim | `inset 0 1px 0 rgba(255,255,255,.85)` | `inset 0 1px 0 rgba(197,163,255,.22)` |
| Inset input | `inset 0 2px 4px rgba(91,64,39,.08)` | `inset 0 2px 5px rgba(14,9,25,.28)` |
| Raised primary edge | 3px downward edge using `light-primary-edge` | 3px downward edge using `dark-primary-edge` |

These are normative design recipes in prose; the provided format does not define a top-level shadow token group. Implement equivalent named elevation tokens in the application's own styling system.

Panels have a fine outer rim and inner highlight. Use the stronger control-outline tokens where the boundary communicates affordance. Keep broad surfaces matte; optional grain must be barely visible and absent beneath dense text. Gloss belongs on small badges, primary buttons, and the character. Highlights must not wash out labels. Nightspell glows are restrained around mint status marks or the wand, never a luminous border around every object.

Pressed buttons move down 2px and shorten their lower shadow. Hover/focus must not shift surrounding layout. Use 120–180ms color/shadow transitions and at most 180–240ms for panel collapse. Under reduced motion, remove translation, collapse animation, and blinking; retain a static cursor and all state feedback.

## Shapes

Panels: 20px corners. Dialog: 24px. Cards: 14px. Inputs: 12px. Small keycaps: 4–8px. Primary actions: fully rounded capsules. Secondary controls may be capsules or soft rounded pills from the same family; do not mix sharp rectangular controls with puffy actions.

Icon-only controls are rounded coins with a target of at least 44 × 44px; the visible glyph can be 18–24px. Keep outlines approximately 2px with rounded caps/joins. Use check, X, terminal, eye, shuffle, bin, expand, and sparkle symbols from a consistent icon family. TRUE/FALSE badges and card metadata retain their explicit meanings in both themes.

The mascot is a small cream/caramel cat in a violet robe and wizard hat, round teal glasses, holding a wand with a golden sparkle. Preserve its friendly expression and recognizable proportions across themes. Change only ambient/rim lighting for Nightspell. Keep it around 120–160px in the desktop input panel, below controls; reduce or hide the decorative illustration when space is scarce. It must not cover controls, compete with statements, or function as a required instruction. Do not add unrelated creatures, potion bottles, or crystals solely because the palette evokes magic.

## Components

### Theme selector

Add a compact two-option control in the header: `Light` with sun icon and `Dark` with moon icon. Use a labeled radio group (`Theme`) or equivalent accessible single-choice control. Selected state has a raised fill, visible indicator, and checked semantics. Keep both choices discoverable; an unlabeled icon alone is insufficient.

Nightspell is the proposed first-visit default, reflecting the latest selected reference. Restore an explicit saved theme on subsequent visits. Persist this visual preference locally and apply it before first paint to avoid a flash of the wrong theme. No automatic system-following mode is required. Switching themes must never reset input, card IDs/order/zones, progress, answer mode, console history, open stdin state, focus, or scroll position. Theme choice is a preference; `clean` does not reset it.

### Header and progress

Use the exact title `veritas — tf-board 1.0`. Display `N/M sorted`, where N is the number in TRUE plus FALSE and M is the total card count. Pair a real accessible progress value with an eight-segment visual bar inspired by `████░░░░`. For M=0 show `0/0 sorted` and zero fill, not an indeterminate loader. Set full segments to `floor(8 × N/M)`; only complete sorting fills all eight. Exact status remains available through the counter and progress semantics. Counts are tabular and update after every move.

### stdin panel and textarea

Header: terminal icon, `stdin`, and `minimize` only while cards exist. Textarea ID: `buffer`. Label: `One statement per line`. Use inset surfaces, visible focus, comfortable padding, a useful placeholder, and an optional line count. Save the draft while typing, before cast; never present a save-success indicator before successful persistence. If saving fails, retain the draft and show a concise retryable error.

Parsing removes one leading list marker (`1.`, `2)`, `3 -`, `-`, `*`, or `•`) and surrounding whitespace. Ignore empty lines; preserve the rest of each statement. Do not use placeholder examples as actual data or deduplicate repeated statements without instruction.

| Action | Behavior | Disabled condition |
|---|---|---|
| `cast` | Replace the entire board with parsed cards in UNSORTED; reset answer mode; collapse stdin. `Ctrl/Cmd + Enter` does the same. | No nonempty parsed lines, or relevant blocking operation |
| `shuffle` | Shuffle UNSORTED only; preserve all card IDs and the TRUE/FALSE order. | Fewer than two unsorted cards; also locked during answer view |
| `clean` | Open the confirmation dialog; do not clear immediately. | Both buffer and board are empty |
| `minimize` | Collapse stdin without discarding the draft. | Hidden while no cards exist |
| `open stdin` | Expand the saved input panel. | Not applicable |

`cast` is the sole dominant primary action. Show `cast replaces the whole board` as a nearby helper. Shortcut hints have their own inset keycaps. Successful cast assigns stable `#1…#M` IDs until the next cast. Do not renumber cards when moving or shuffling.

### Board toolbar and answer view

Toolbar: board title plus `answer view`, disabled when the board is empty. Active label: `exit answers`. Show `N/M answers ready`; if any remain unsorted, also show `!! X unanswered — exit answer view to sort them.`

Answer view retains statements and zones but disables drag, move menus, card T/F/U shortcuts, move commands, and shuffle. Counts are unchanged. Keep UNSORTED visible so unanswered statements are not hidden. Review mode is not automatic fact-checking: TRUE and FALSE are the user's verdicts. `cast`, if used from reopened stdin, replaces the board and exits answer view; `clean` remains available through confirmation.

### Zone containers and statement cards

Order: UNSORTED, then TRUE and FALSE. Each header contains a symbol, name, and count. Each card has a metadata row with `[ ]`, `[+]`, or `[-]` and stable `#n`, a `···` menu, and the full statement. All cards share the same shape and neutral surface; semantics live in metadata and parent-zone accents. No arbitrary per-card colors or rotations in the resting layout.

| State | Visual and interaction treatment |
|---|---|
| Rest | Raised surface, subtle rim, readable statement |
| Hover | Slightly stronger rim/shadow; preserve text position |
| Keyboard focus | 2px theme focus ring plus 2px offset, visibly distinct from zone border |
| Dragging | A copy follows the pointer; original becomes a dashed placeholder retaining its dimensions |
| Valid drop target | Stronger theme/status outline plus tinted background; do not communicate eligibility only by color |
| After move | Update all affected counts, metadata, and progress; announce the result without stealing focus |
| Answer view | Hide unavailable move controls, show locked-review context; preserve readable cards |

All four move mechanisms call the same state transition: drag/drop, `···` menu, focused-card T/F/U, and console commands. Menu items are `move to …` for exactly the other two zones. Arrow keys move focus between cards in visible reading order. Keep focus on the moved card or a deliberate adjacent target; never lose it to the document body. On touch, provide a reliable long-press drag with scrolling preserved, and retain the menu as a fully usable alternative.

### Empty states

| Condition | Required copy and treatment |
|---|---|
| No cards | Small ASCII cat and `Paste lines into stdin, then run cast`. The illustrated wizard may accompany it, but never replace the required instruction. |
| UNSORTED empty, cards exist | `every statement has a verdict` with a restrained success badge |
| TRUE empty | `Drag a card here, or run t <n>` |
| FALSE empty | `Drag a card here, or run f <n>` |

In answer view, replace drag instructions with a neutral `No statements here` so the UI does not suggest disabled actions. Keep empty drop areas tall enough to remain discoverable and usable. ASCII art is decorative and hidden from screen readers; the instruction stays accessible.

### Console and commands

Console uses the active theme's panel frame and dark/cream inset well, not a disconnected terminal color scheme. Header includes `console` and an optional `help` control. Retain the last 60 log lines, with scroll access to older retained entries. Errors use `!!` and the error foreground; successful moves show `#3 → TRUE`. User-supplied content is rendered as text, never executable markup.

Command input ID: `cmd`; placeholder: `type help`. Use an accessible real input with a terminal-style blinking block cursor, without obscuring characters or text selection. Up/down arrows browse command history. Escape first closes a card menu; otherwise it focuses the command field. A modal has priority over global shortcuts: Escape closes it and restores focus before console focus shortcuts apply.

| Command | Result |
|---|---|
| `cast` | Same replacement operation as the primary button |
| `t <n…>` / `true <n…>` | Move to TRUE; accept `t 3`, `t 1 4`, `t 2-6` |
| `f <n…>` / `false <n…>` | Move to FALSE using the same selectors |
| `u <n…>` / `unsorted <n…>` | Return to UNSORTED |
| `shuffle` | Shuffle only UNSORTED |
| `stats` | Show `total · true · false · unsorted` with current counts |
| `clean` | Open the destructive confirmation |
| `clear` | Clear only the console log |
| `help` | List commands, syntax, and shortcuts |

Validate the full selector before a batch move. Unknown IDs or malformed ranges reject the batch with no partial movement. Duplicate IDs are processed once. Already-in-zone cards produce a clear notice; valid remaining cards may move. Give useful messages for a missing selector, nonexistent ID, already-in-zone card, empty board, malformed input, and locked answer mode. An example: `!! #9 is not on this board.` Never silently drop errors.

### Clean confirmation

Title: `Drop every statement?`. Explain that input, cards, and the saved session will be removed. Actions: `cancel` and `clean`; focus cancel initially. The clean action uses an error-colored outline or darker destructive surface with a verified contrasting label, not a successful TRUE accent. Backdrop click or Escape dismisses without clearing. Trap focus while open and restore it on cancel. After successful clean, show the empty board, expand stdin, and focus the textarea. Preserve the theme preference.

For an asynchronous clean, show a busy state, prevent repeated submission, and do not report success before persistence completes. If deletion fails, retain the board and explain how to retry.

### Shared interaction and accessibility states

Use real buttons, labels, form controls, and semantic headings. Tooltips can clarify icons but cannot substitute for accessible names. Every pointer-only action has a keyboard/menu alternative. Keep disabled controls identifiable; avoid opacity on the entire panel. Do not use hover as the sole way to reveal required information on touch.

Use a polite status announcement for moves and progress; avoid announcing every keystroke or flooding the user with the full log. Preserve readable error messages until resolved. Keep focused controls out from under the console or soft keyboard. Save feedback must distinguish loading, saving, saved, and failed; decorative screenshot text such as `session saved` is not a substitute for real state.

## Do's and Don'ts

**Do**

- Build one component set with explicit semantic theme mappings and complete light/dark variants.
- Preserve the clear working layout, modest headings, readable cards, and small supporting mascot.
- Use the supplied dark palette exactly for base tokens; use derived tints only where documented.
- Use tokens for spacing, typography, radii, color, and reusable elevation recipes.
- Keep translucent highlights behind or away from body text.
- Treat the original behavior requirements as authoritative and demo data as illustrative.
- Verify desktop, mobile, long statements, many cards, empty states, error states, and 200% text zoom in both themes.

**Don't**

- Add an unsupported top-level `themes` block to this file, duplicate `##` headings, or use unresolved references.
- Assume unprefixed palette colors dynamically switch themes; resolve explicit light/dark tokens.
- Recreate the mockup as a single image containing noninteractive UI text.
- Add decorative neon borders to every card, giant typography, harsh black outlines, or unrelated scenery.
- Equate FALSE with an application error or an objectively incorrect answer.
- Hide unsorted cards in answer view, append on cast, shuffle sorted zones, or renumber moved cards.
- Clear unsaved input during theme changes, collapse, or an unrelated console command.
- Claim pixel-exact font identification, exact sampled light colors, or complete accessibility from the reference image alone.

**Acceptance checklist**

- [ ] Frontmatter parses as YAML; all token references resolve; canonical sections appear once and in order.
- [ ] First visit uses Nightspell; choosing Daylight persists and causes no wrong-theme flash.
- [ ] Changing themes preserves all board data, review state, console history, focus, and scroll.
- [ ] All eight progress segments reflect actual state; `0/0` and full completion render correctly.
- [ ] Cast parses supported markers, replaces the board, and collapses stdin; draft saves before cast.
- [ ] Drag, menu, card shortcuts, and commands produce equivalent results and correct counts.
- [ ] Answer view locks sorting consistently and identifies remaining unanswered cards.
- [ ] Clean requires confirmation; cancel/backdrop preserves data; successful clean resets the session but not theme.
- [ ] Body text, compact button labels, essential icons, and focus rings meet their contrast targets in every state.
- [ ] At 1440px, 1024px, 768px, and 375px, plus the 320px minimum and 200% text zoom, content remains readable without horizontal overflow or console overlap.
- [ ] Reduced-motion, touch, keyboard navigation, dialog focus, and screen-reader status updates remain usable.
