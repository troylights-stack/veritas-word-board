# Veritas board: behavior spec

This file describes what the shipped board does. The look (tokens, themes, components) lives in [DESIGN.md](DESIGN.md). Where the two disagree, this file describes the build; see [Differences from DESIGN.md](#differences-from-designmd).

## Contents

1. [Data model](#1-data-model)
2. [Screen layout](#2-screen-layout)
3. [Sorting a card](#3-sorting-a-card)
4. [Answer view](#4-answer-view)
5. [Themes](#5-themes)
6. [Mascot](#6-mascot)
7. [Responsive behavior](#7-responsive-behavior)
8. [Accessibility](#8-accessibility)
9. [Differences from DESIGN.md](#differences-from-designmd)

---

## 1. Data model

```js
board = {
  input: "raw textarea text",
  stickers: [
    { id, text, zone: "unsorted" | "true" | "false", rotation }
  ]
}
```

- There are exactly three zones: `unsorted`, `true`, `false`.
- The card number (`#3`) is fixed when the board is cast. The index is encoded in the id (`clue-<time>-<index>-<random>`), so moving or shuffling never renumbers a card.
- `rotation` comes from an earlier sticker design. `board-state.js` still stores it, but this page does not use it.
- The board saves to `localStorage` under `veritas-board-v2` after every change, including while typing.
- The theme saves separately under `veritas-theme`.

State logic lives in two modules with unit tests:

| File | Responsibility |
|---|---|
| `board-state.js` | Parse input, create the board, move a card, validate saved data, compute the answer-view state |
| `composer-layout.js` | Decide when the stdin panel may collapse and which toggle to show |

## 2. Screen layout

Top to bottom:

### Header
- The `veritas — tf-board 1.0` title.
- Progress text `N/M sorted`: N counts cards in TRUE or FALSE, M counts all cards.
- An 8-segment bar. The number of full segments is `floor(8 × N / M)`, and it has real progressbar semantics.
- A Light / Dark theme switch.

### stdin panel (left)
- **Textarea** (`#buffer`): one statement per line.
  - One leading list marker is stripped from each line: `1.`, `2)`, `3 -`, `-`, `*` or `•`.
  - Empty lines are ignored.
  - A live line count shows below.
- **cast**: replaces the whole board with the parsed cards, all in UNSORTED, and turns off answer view. It then collapses stdin and focuses the first card. `Ctrl/⌘ + Enter` does the same. It is disabled when there is nothing to parse.
- **shuffle**: reorders UNSORTED only. It is disabled with fewer than two unsorted cards, and in answer view.
- **clean**: opens a confirmation dialog (focus starts on **cancel**; Escape or a backdrop click cancels). Confirming clears the input, the cards and the saved session, then reopens stdin and focuses the textarea. The theme is kept.
- **minimize / open stdin**: shown only when cards exist. Collapsed, the panel is a narrow rail on desktop and a strip on mobile. The draft is never lost.
- **Tip**: "Focus a card, then press T / F / U".
- **Mascot**: see [section 6](#6-mascot).

### Sorting board (right)
- **Toolbar**: the board title and the **answer view / exit answers** button, which is disabled while the board is empty.
- **UNSORTED zone**, then **TRUE** and **FALSE** side by side. Each zone shows a badge, a name and a count.
- **Card**:
  - a drag grip;
  - the zone mark (`[ ]`, `[+]` or `[-]`) and `#n`;
  - a `···` menu with "move to …" for the other two zones;
  - the full statement, which wraps and is never truncated.
- **Empty states**:

  | Condition | Text |
  |---|---|
  | No cards at all | ASCII cat + "Paste lines into `stdin`, then run `cast`" |
  | UNSORTED empty, cards exist | "every statement has a verdict" |
  | TRUE or FALSE empty | "Drag a card here, or use its menu" |
  | TRUE or FALSE empty in answer view | "No statements here" |

- **Hint strip**: "drag a card · use its menu · press T / F / U".

### Status strip (bottom)
- **Left**:
  - A readiness line: "ready when you are", "N statements left to sort", "every statement has a verdict" or "reviewing your answers".
  - Problems and notices appear here for 6 seconds and are announced to screen readers. For example: "#4 is already UNSORTED", "shuffle: needs at least two unsorted statements", or "could not save".
- **Right**: the real save state: "nothing saved yet", "session saved", "saved session cleared", or "not saved" with a **retry** button.

## 3. Sorting a card

These four ways all run the same state change and give identical results.

| Method | How |
|---|---|
| Drag and drop | Mouse: drag after moving 5px. Touch: long-press (380ms), then drag. The original leaves a dashed placeholder; the target zone gets a dashed outline, a tint and a "release to move here" label. Dragging near an edge scrolls the board. |
| Menu | `···` opens a menu. Arrow keys, Home and End move inside it; Escape closes it and returns focus to the button. |
| Keyboard on a focused card | `T` moves to TRUE, `F` to FALSE, `U` to UNSORTED. `Enter` or `Space` opens the menu. Arrows, Home and End move between cards in reading order. |
| Moving to its current zone | No change; the notice "#n is already …" appears. |

After a move:
- The counts, the progress bar and the readiness line all update.
- Focus stays on the moved card.
- The move is announced to screen readers.
- The board uses a roving tab index, so Tab enters it once instead of stopping on every card.

## 4. Answer view

A locked, read-only review that fits every card on screen.

- Sorting is locked:
  - no drag, no `···` menus, no T/F/U, no shuffle;
  - the toolbar shows a "sorting locked" chip and `N/M answers ready`.
- If cards are still unsorted, a warning appears: `!! X unanswered — exit answer view to sort them.` UNSORTED then stays visible so those cards are not hidden.
- To free space:
  - the stdin panel hides and the board takes the full width;
  - UNSORTED hides when it is empty;
  - the hint strip hides;
  - cards flow into columns.
- **Fit to viewport**: the `--rv` scale is binary-searched between 1 and 0.55. The page uses the largest scale at which the board needs no scrollbar. It shrinks card text, padding and gaps; statement text never goes below 12px. The fit reruns on resize, after fonts load, and after the layout transition.
- On viewports narrower than 900px or shorter than 700px, answer view scrolls normally instead of scaling.
- Turning answer view on or off does not change any verdicts. `cast` turns it off.

## 5. Themes

- **Nightspell** (dark) is the first-visit default. **Daylight** (light) is the alternative.
- An inline script in `<head>` applies the saved theme before first paint, so the wrong theme never flashes.
- Switching themes never resets the input, cards, answer view, focus or scroll.
- Every color comes from semantic CSS variables mapped per theme on `:root[data-theme]`. No filters or inversion are used, with one exception: the FALSE badge sprite is hue-shifted to warm red in Daylight.

## 6. Mascot

The cat in a wizard hat sits at the bottom of the stdin panel, with two handwritten notes. It is decorative (`aria-hidden`).

- **Sizing**: in app-height layouts the cat keeps a slot of `clamp(150px, 100dvh − 700px, 240px)`, and the textarea gives up height first. On windows under 860px tall, the stdin tip hides to make room. The mascot is hidden below 900px width and in answer view.
- **Animation** (CSS only; overlay positions are percentages of the 1254px source image):

  | Part | Effect |
  |---|---|
  | Blink | Fur-colored lids with a lash line close over both eyes on a 9s cycle: one slow blink, then a quick double blink |
  | Wand | A warm glow pulses on the star; small sparkle motes drift off it |
  | Stars | Six stars twinkle, each on its own timing |

- With `prefers-reduced-motion`, the cat stays still with its eyes open.

## 7. Responsive behavior

| Viewport | Layout |
|---|---|
| ≥ 1200px | 380px stdin column + board. UNSORTED uses up to two card columns; TRUE and FALSE sit side by side. |
| 900–1199px | 300px stdin column; smaller mascot. |
| < 900px | Single column: header, stdin (or its strip), UNSORTED, TRUE, FALSE. The mascot is hidden. |
| ≥ 900px wide and ≥ 700px tall | App-height mode: the page fills the window, and the board and stdin scroll inside their panels. |

- The minimum supported width is 320px, with no horizontal page scroll.
- Long words wrap (`overflow-wrap: anywhere`).

## 8. Accessibility

- Real buttons, labels and headings are used.
- The theme switch is a labeled radio group.
- Every pointer action has a keyboard alternative.
- Focus rings use the theme's focus token (2px ring, 2px offset).
- A polite live region announces moves, answer-view changes and notices.
- The dialog uses native `<dialog>`: it traps focus and returns focus to its trigger when closed.
- With `prefers-reduced-motion`, translations, blinking and decorative animation stop.

## Differences from DESIGN.md

DESIGN.md was written before these decisions. The build follows this list.

| DESIGN.md says | The build does | Why |
|---|---|---|
| A docked **console** with commands (`t 3`, `f 2-6`, `stats`, `help`…), a log and a command input | **No console.** Cards move by drag, menu or T/F/U; notices appear in the status strip. | Removed at the owner's request, to keep the screen focused on the board |
| Answer view keeps the normal layout | Answer view **hides stdin, empty UNSORTED and the hint, and scales to fit the viewport** | Owner request: see every answer without scrolling |
| stdin column 320px | 380px on wide screens | Statements wrap less in the 16px mono input |
| Mascot 120–160px, "reduce or hide when space is scarce" | Up to 200px, kept visible by shrinking the textarea first; animated (blink, wand glow, twinkling stars) | Owner request to keep the cat and bring it to life |
| Generic stroke icons | Raster icons, badges and keycaps cut from `assets/source/image_assets_02.png` | Owner-supplied asset sheet |
