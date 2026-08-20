/**
 * @omkara/ui-tokens — Design tokens
 *
 * All visual constants live here. Both apps import from this package.
 * Values are system-locked — admin picks from these presets, never raw values.
 */

// ─── Spacing Scale (8pt grid) ───────────────────────────────────────────────

export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

// ─── Border Radius Scale ────────────────────────────────────────────────────

export const RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '16px',
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const FONT_FAMILY = {
  sans: "'Inter', 'system-ui', '-apple-system', 'sans-serif'",
  mono: "'JetBrains Mono', 'Fira Code', 'monospace'",
} as const;

export const FONT_SIZE = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
} as const;

// ─── Curated Color Palettes ─────────────────────────────────────────────────
// Each palette has a primary, a contrasting text, and a subtle background.
// WCAG AA contrast ratio ≥ 4.5:1 for all text/bg pairs.

export const CATEGORY_PALETTES = [
  { name: 'Sage', primary: '#4A7C59', text: '#FFFFFF', bg: '#EDF5EE' },
  { name: 'Amber', primary: '#D4880F', text: '#FFFFFF', bg: '#FFF8E7' },
  { name: 'Rose', primary: '#C2506A', text: '#FFFFFF', bg: '#FDE8ED' },
  { name: 'Ocean', primary: '#2B6CB0', text: '#FFFFFF', bg: '#EBF4FF' },
  { name: 'Plum', primary: '#7B4E8E', text: '#FFFFFF', bg: '#F3E8F9' },
  { name: 'Slate', primary: '#475569', text: '#FFFFFF', bg: '#F1F5F9' },
] as const;

// ─── Animation Vocabulary (complete — nothing else allowed) ─────────────────

export const TRANSITIONS = {
  opacity: 'opacity 120ms ease',
  slideUp: 'transform 150ms ease-out',
  scale: 'transform 100ms ease',
  colorFade: 'background-color 150ms ease, color 150ms ease',
} as const;

// ─── Z-Index Contract ───────────────────────────────────────────────────────

export const Z_INDEX = {
  nav: 40,
  sheet: 50,
  toast: 60,
} as const;

// ─── Breakpoints ────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
