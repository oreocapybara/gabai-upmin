# Gabai UPMin Design System

A highly scalable, type-safe design system bridged directly from Figma tokens to Tailwind CSS.

## Architecture Overview

The system follows a **3-Tier Architecture** for separation of concerns and maintainability:

1. **Figma Tokens** — Source of truth for all design decisions
2. **CSS Variables** (`globals.css`) — Raw primitive colors and theme definitions
3. **Tailwind Config** (`tailwind.config.ts`) — Semantic utility classes used in React components

This architecture ensures that design changes ripple through the entire codebase automatically, and Dark Mode can be implemented without touching a single React component.

---

## 1. Primitives vs. Semantics

Our color system has two layers. **Always use semantic tokens in your components.**

| Layer             | Examples                           | Location           | Purpose                                                 |
| :---------------- | :--------------------------------- | :----------------- | :------------------------------------------------------ |
| **Primitives** ❌ | `blue-500`, `grey-200`             | `globals.css` only | Define the raw color palette                            |
| **Semantics** ✅  | `content-primary`, `surface-brand` | Components         | Purpose-driven colors that adapt to brand/theme changes |

Using semantic tokens ensures your components work seamlessly when the brand changes or when Dark Mode is implemented.

---

## 2. Typography

We use **Montserrat** (bold) for display and headings, and **Inter** (regular) for body text.

### Base HTML Elements

Standard HTML text elements are automatically styled by the `@layer base` rules in `globals.css`. **Do not add utility classes to these elements**—they're pre-configured:

| Element         | Font       | Style     | Size                  | Default                                 |
| :-------------- | :--------- | :-------- | :-------------------- | :-------------------------------------- |
| `<h1>` – `<h5>` | Montserrat | Bold      | 4xl → l (auto-scaled) | —                                       |
| `<p>`           | Inter      | Regular   | m (16px)              | —                                       |
| `<small>`       | Inter      | Regular   | s (13px)              | `content-secondary`                     |
| `<a>`           | Inherit    | Underline | Inherit               | Brand link colors + hover/active states |

### Text Utility Classes

When you need custom text styling, use these semantic classes. **Line-height is automatically paired with each size:**

| Class      | Font Size | Line Height | Use Case               |
| :--------- | :-------- | :---------- | :--------------------- |
| `text-xs`  | 10px      | 15px        | Footnotes, micro text  |
| `text-s`   | 13px      | 20px        | Captions, small labels |
| `text-m`   | 16px      | 24px        | Body text (default)    |
| `text-l`   | 20px      | 30px        | Large body, emphasis   |
| `text-xl`  | 25px      | 38px        | Subheadings            |
| `text-2xl` | 31px      | 47px        | Subheadings            |
| `text-3xl` | 39px      | 59px        | Headings               |
| `text-4xl` | 61px      | 92px        | Hero headings          |

---

## 3. Colors

All colors are strictly typed. Use your IDE's IntelliSense to autocomplete: start typing the prefix (e.g., `text-content-`) to see available tokens.

### Content (Text & Icons)

Prefix: `text-` (e.g., `text-content-primary`)

| Token                                                                              | Purpose                                             |
| :--------------------------------------------------------------------------------- | :-------------------------------------------------- |
| `content-primary`, `content-secondary`, `content-tertiary`                         | Default text hierarchy                              |
| `content-brand`                                                                    | Brand-colored text                                  |
| `content-disabled`                                                                 | Disabled/inactive text                              |
| `content-inverse-primary`, `content-inverse-secondary`, `content-inverse-tertiary` | Text on dark backgrounds                            |
| `content-notice`, `content-positive`, `content-negative`                           | Semantic feedback (add `-bold` for higher contrast) |
| `content-link`, `content-link-hover`, `content-link-pressed`                       | Link states                                         |

### Surface (Backgrounds)

Prefix: `bg-` (e.g., `bg-surface-primary`)

| Token                                                                     | Purpose                                              |
| :------------------------------------------------------------------------ | :--------------------------------------------------- |
| `surface-primary`, `surface-hover`, `surface-pressed`, `surface-selected` | Interactive surface states                           |
| `surface-disabled`                                                        | Disabled backgrounds                                 |
| `surface-inverse`                                                         | Backgrounds for inverted layouts                     |
| `surface-brand`, `surface-brand-hover`, `surface-brand-pressed`           | Brand/primary action backgrounds                     |
| `surface-info`, `surface-notice`, `surface-negative`, `surface-positive`  | Semantic feedback (add `-subtle` for light variants) |

### Stroke (Borders)

Prefix: `border-` (e.g., `border-stroke-primary`)

| Token                                                               | Purpose                   |
| :------------------------------------------------------------------ | :------------------------ |
| `stroke-primary`, `stroke-secondary`, `stroke-tertiary`             | Default border hierarchy  |
| `stroke-disabled`                                                   | Disabled/inactive borders |
| `stroke-brand`, `stroke-inverse`, `stroke-focus`                    | Special border states     |
| `stroke-info`, `stroke-notice`, `stroke-negative`, `stroke-success` | Semantic feedback         |

---

## 4. Spacing

Spacing tokens apply to padding (`p-`), margin (`m-`), and gaps (`gap-`). Use directional abbreviations: `x` = left/right, `y` = top/bottom.

| Token | Pixels | Examples                   |
| :---- | :----- | :------------------------- |
| `xs`  | 4px    | `gap-xs`, `px-xs`, `my-xs` |
| `s`   | 8px    | `p-s`, `m-s`, `px-s`       |
| `m`   | 12px   | `py-m`, `gap-m`, `mt-m`    |
| `l`   | 16px   | `p-l`, `mb-l`, `gap-l`     |
| `xl`  | 24px   | `p-xl`, `gap-xl`, `pt-xl`  |
| `2xl` | 32px   | `mt-2xl`, `px-2xl`         |
| `3xl` | 40px   | `py-3xl`, `gap-3xl`        |
| `4xl` | 48px   | `gap-4xl`, `p-4xl`         |
| `5xl` | 56px   | `pt-5xl`, `my-5xl`         |

---

## 5. Dark Mode & Theming (Future Implementation)

This project uses `next-themes` for theme management. Because we rely entirely on semantic CSS variables, **Dark Mode requires zero changes to React components**.

### Implementation

To add dark mode, define the `.dark` class selector in `globals.css` and re-map semantic variables to their dark equivalents:

```css
.dark {
	--background-primary: var(--color-grey-900);
	--content-primary: rgb(var(--color-white));
	/* ...re-map remaining semantic variables */
}
```

All components using semantic tokens automatically adapt without modification.

---

## Code Examples

### ❌ Bad — Don't Do This

Hardcoded values and primitive colors break the design system and won't work in dark mode:

```tsx
<button className="bg-[#8a1538] text-[16px] px-[16px] py-[8px]">
	Click Me
</button>
```

### ✅ Good — Do This

Always use semantic design tokens:

```tsx
<button className="bg-surface-brand hover:bg-surface-brand-hover text-content-inverse-primary text-m px-l py-s rounded-md transition-colors">
	Click Me
</button>
```

**Why this works:**

- Colors automatically adapt to brand/theme changes
- Spacing and typography scale consistently
- Dark Mode works without any component changes
- IntelliSense provides autocomplete for all tokens

---

## Quick Reference

### Color Token Prefixes

| Prefix    | Use Case             | Example                 |
| :-------- | :------------------- | :---------------------- |
| `text-`   | Text and icon colors | `text-content-primary`  |
| `bg-`     | Background colors    | `bg-surface-brand`      |
| `border-` | Border colors        | `border-stroke-primary` |

### Spacing Abbreviations

| Abbreviation | Meaning                | Example        |
| :----------- | :--------------------- | :------------- |
| `p-`         | Padding (all sides)    | `p-l`          |
| `px-`        | Padding (left & right) | `px-m`         |
| `py-`        | Padding (top & bottom) | `py-xl`        |
| `m-`         | Margin (all sides)     | `m-l`          |
| `mx-`, `my-` | Margin (directional)   | `mx-m`, `my-s` |
| `gap-`       | Flex/grid gap          | `gap-l`        |

### Font Size Quick Map

| Class                | Use                  |
| :------------------- | :------------------- |
| `text-xs`            | Tiny, secondary text |
| `text-s`             | Small captions       |
| `text-m`             | Default body text    |
| `text-l`             | Emphasis, large body |
| `text-xl`–`text-4xl` | Headings & displays  |

---

## Common Pitfalls

### ❌ Don't Mix Primitive & Semantic Colors

```tsx
// Wrong: mixing both systems
<div className="bg-blue-500 text-content-primary">
```

### ❌ Don't Use Arbitrary Values for Design Tokens

```tsx
// Wrong: arbitrary hardcoded values
<div className="p-[23px] text-[17px]">
```

### ✅ Do Use Semantic Tokens Everywhere

```tsx
// Correct: all from the design system
<div className="bg-surface-primary text-content-primary p-l text-m">
```

### ✅ Do Leverage Base HTML Styling

```tsx
// Correct: h1, p, a are pre-styled
<h1>Title</h1>
<p>Body text</p>
<a href="#">Link</a>
```

---

## File Locations

- **Design tokens source:** `Figma` (see team workspace)
- **Global styles:** [globals.css](app/globals.css)
- **Tailwind config:** [tailwind.config.ts](tailwind.config.ts)
- **TypeScript types:** [types/index.ts](types/index.ts)
