# CyberUI Web design system

## Visual identity

Neon dark: background #1E1517, ink #93E4EA, muted #C9A19C, separator #5A3A3C,
soft surface #3E2729, command accent #E0574B, secondary accent #93E4EA.
Use seven theme palettes with separate light and dark values.
Do not derive light palettes by inversion. Filled controls choose the higher-contrast
foreground. Status colors are separate from the brand command color.
The raw preset palettes remain available in `schemes`. `createTheme` resolves
body, muted and semantic text to at least 4.5:1 against both background and soft
surfaces. `accentText` uses the raw accent only when it meets that threshold;
otherwise it uses readable ink. Fills, outlines and artwork keep the preset accent.
Custom soft surfaces that cannot support readable text fall back to the background.

## Geometry

- No rounded corners. Chamfers: 12px for commands/panels, 8px for small controls.
- Border: 2px; divider: 1px; bracket arm: 16px.
- Corner names are literal top-left, top-right, bottom-right, bottom-left.
- Primary and secondary default: top-right + bottom-left; compact controls: top-right.
- Panel shapes: frame, chamfer, brackets, header, rail, none.
- Preserve the semantic HTML host's complete hit area and focus ring. Only decorative
  layers are clipped, and decorations have pointer-events:none and aria-hidden.

## Type

Oxanium display/body, Share Tech Mono readouts. System CJK fallback for Chinese.
Web body starts at 16px, line height 1.6. Small labels 12–14px, titles 24–40px,
display 56–88px on desktop. Uppercase for English technical labels, natural case
for prose. Numbers use tabular figures. Long values wrap or expose full accessible text.
All vendor fonts are self-hosted and font-display:swap. Font configurations retain
14 presets; the system preset maps to browser system fonts.

## Spacing and responsiveness

Base spacing scale: 4/6/10/14/18px. Extended web layout: 24/32/48/64px.
Navigation shell uses a 216px rail on desktop, a drawer on small screens.
Content includes one visual priority per page. Dense components use short borders
and local toolbars. Breakpoints: 600/768/1024/1440px; validate at 375px.
Reference scenes offer a 3:4 canvas, while fit mode reflows actual HTML.

## Interaction and accessibility

- Feedback within 100ms. Shared transitions: 120ms state, 180ms enter, 120ms exit.
- Respect reduced motion. No perpetual blinking or flashing on reading surfaces.
- Buttons/inputs target 44px by default. Compact options retain keyboard support.
- Native form semantics; visible labels; inline error association; failed forms focus
  an error summary (or their first invalid field). Never use placeholders as labels.
- Overlays manage focus, Escape, dismissal, and returning focus through React Aria.
- Never communicate success, risk, selection, or progress using color alone.
- Body/normal text >=4.5:1; meaningful control outlines >=3:1. Test light/dark separately.
- Charts include accessible descriptions and a table of exact values.
- SkylineCalendar keeps all days visible as decorative columns, with one native
  range input for pointer, touch and arrow/Home/End selection. Announce day/pages,
  show selection in the skyline, and provide an exact-data disclosure below it.

## Component contract

65 named visual components. Variants do not count as separate components.
`CyberUIProvider` resolves scheme/mode/locale and exposes semantic CSS variables.
Value-bearing controls allow controlled/uncontrolled usage. Native attributes and refs
remain available. Core exports do not depend on documentation routes or demo storage.
The stylesheet is explicit; font loading is a separate optional stylesheet.
Button and IconButton expose six appearances and three sizes; Avatar shows three
size specimens. Panel has six border shapes, Progress five signals, Chart three
forms, and JackInCard standard/terminal/poster/ticket/scanner. The shop provides
five selectable appearances each for frames, backdrops, flairs and jack-ins.

## Documentation and application scenes

Every component: live preview, adjustable parameters, copyable source, props, keyboard guidance.
Replica scenes use the public components and a separate persistent/resettable demo store.
Reference data/time are deterministic. Reference images remain comparison artifacts;
demo artwork is local original SVG/ASCII artwork. Hardware and book opening are explicitly demos.
Only English and Simplified Chinese are fully translated; other source languages are specimens.

## Guidance verification

ui-ux-pro-max style search matched Cyberpunk UI and HUD/Sci-Fi FUI. Their general
neon/glow recommendations yield to the system's flat, hard-edged rendering.
React guidance: typed reusable controls, shared state hooks, accessible test queries.
UX guidance: visible/unobscured focus; focusable error summaries and inline errors.

## Web application scenes

ORBIT (project workspace), PULSE (AI productivity landing page) and NOVA (Agent chat)
are independent product examples composed from the same public components. Their
canvas uses container queries so embedded and standalone views adapt to available
width. Preserve the master palette and fonts; differentiate products through layout,
type scale, information density and composition. New scenes do not use reader status
bars, bottom navigation or image-reference controls.

Keep primary project progress visible across widths. Use menus as the pointer and
keyboard alternative to dragging task cards. Keep chat controls reachable as the
message log scrolls; never force a user away from an earlier message. Live status
announces generation start/finish rather than every streamed chunk. Tool decorations
must not change accessible control names. Selected navigation uses readable text on
the soft surface, including its nested labels and counts.
