---
name: Vivid Hearth
colors:
  surface: '#fff8f5'
  surface-dim: '#e0d9d5'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf2ee'
  surface-container: '#f4ece9'
  surface-container-high: '#eee7e3'
  surface-container-highest: '#e8e1dd'
  on-surface: '#1e1b19'
  on-surface-variant: '#4e453d'
  inverse-surface: '#33302d'
  inverse-on-surface: '#f7efeb'
  outline: '#80756c'
  outline-variant: '#d2c4ba'
  surface-tint: '#725a42'
  primary: '#33210d'
  on-primary: '#ffffff'
  primary-container: '#4b3621'
  on-primary-container: '#bd9f83'
  inverse-primary: '#e1c1a4'
  secondary: '#5f5e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2dd'
  on-secondary-container: '#656461'
  tertiary: '#112a13'
  on-tertiary: '#ffffff'
  tertiary-container: '#274027'
  on-tertiary-container: '#8fac8c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fedcbe'
  primary-fixed-dim: '#e1c1a4'
  on-primary-fixed: '#291806'
  on-primary-fixed-variant: '#59422c'
  secondary-fixed: '#e5e2dd'
  secondary-fixed-dim: '#c9c6c2'
  on-secondary-fixed: '#1c1c19'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#ccebc7'
  tertiary-fixed-dim: '#b0cfad'
  on-tertiary-fixed: '#07200b'
  on-tertiary-fixed-variant: '#334d33'
  background: '#fff8f5'
  on-background: '#1e1b19'
  surface-variant: '#e8e1dd'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 84px
    fontWeight: '900'
    lineHeight: 90px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.02em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  overlap-sm: -24px
  overlap-md: -48px
---

## Brand & Style
The design system targets a Gen-Z demographic that values authenticity, curation, and "main character" energy. It evolves the traditional hearth aesthetic into a digital-first, social-media-inspired experience. The style merges **Modern Minimalism** with **Glassmorphism** and a touch of **Digital Editorial** flair. 

The brand personality is energetic and curated, moving away from "rustic" toward "aesthetic." It utilizes high-contrast visual layering and slightly edgy layouts to evoke a sense of creative confidence. The emotional goal is to feel like a premium digital lookbook—sophisticated yet approachable and inherently shareable.

## Colors
The palette centers on a "Cacao & Cream" foundation, modernized by high-energy accents. 
- **Primary (Cacao):** Used for maximum-impact typography and structural elements.
- **Secondary (Clotted Cream):** The soft, warm base for all surfaces.
- **Tertiary (Matcha Green):** A fresh, desaturated green used for interactive states and glassmorphic highlights.
- **Accent (Terracotta):** A vibrant, earthy orange for calls-to-action and critical focus points.

Glassmorphism is applied using the secondary color at 60-80% opacity with a 20px background blur, creating a sense of depth and lightness. Subtle radial gradients should be used in the background to prevent a flat, clinical feel.

## Typography
The typography strategy is "Editorial Impact." **Playfair Display** is pushed to extreme scales and weights to act as a visual anchor, often overlapping other elements. **Inter** provides a clean, functional contrast. 

To achieve the "magazine" feel, Inter is set with tighter-than-standard tracking (`-0.02em`) for body text. Use `display-xl` for hero sections, allowing the text to break across lines unexpectedly or bleed off the edge of the container to emphasize the edgy, asymmetric aesthetic.

## Layout & Spacing
This design system utilizes an **Asymmetric Fluid Grid**. While based on a 12-column structure, elements should purposefully break the grid to create visual tension.

- **Overlapping:** Use negative spacing tokens (`overlap-sm`, `overlap-md`) to layer images over typography or cards over hero backgrounds.
- **Asymmetry:** Pair a wide column (8 cols) with a narrow column (4 cols) but stagger their vertical alignment.
- **Mobile:** Transition to a single-column layout but maintain the "edge-to-edge" feel for imagery to preserve the immersive social-media aesthetic.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Layered Offsets** rather than traditional shadows.
- **Surfaces:** Use semi-transparent layers with a `backdrop-filter: blur(20px)` and a 1px inner stroke in a lighter tint of the background color to simulate glass edges.
- **Shadows:** Use very soft, long, low-opacity shadows (Color: Cacao at 5% alpha) only for the highest elevation items like modals or primary action cards.
- **Z-Index:** Treat the UI as a series of physical "cut-outs" that can slide over one another.

## Shapes
The shape language is a curated mix of "organic and sharp." 
- **Standard Cards:** Use `rounded-lg` (1rem) for a friendly, modern feel.
- **Interactive Elements:** Buttons and tags should be **Pill-shaped** to contrast against the rectangular layout.
- **Edgy Accents:** Use 0px radius (sharp) for specific "editorial" blocks or image containers to inject a sense of "brutalist" sophistication into the otherwise soft system.

## Components
- **Buttons:** Primary buttons are pill-shaped, using the Terracotta accent color with white text. Hover states should include a slight scale-up effect (1.05x).
- **Cards:** Glassmorphic containers with a 1px solid border. Images within cards should have a slight zoom-on-hover interaction.
- **Chips/Tags:** Small pill-shaped outlines using the Matcha Green palette.
- **Input Fields:** Minimalist under-line style with a floating label. When focused, the line transitions to the Terracotta accent.
- **Lists:** High-density, separated by thin 1px lines in Cacao (10% opacity). Use Inter Bold for list titles to maintain the structured, magazine look.
- **Featured Stories:** A custom component using an asymmetric aspect ratio (e.g., 4:5) for images, with Playfair Display text overlapping the bottom-left corner.