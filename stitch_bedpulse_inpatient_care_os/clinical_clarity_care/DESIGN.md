---
name: Clinical Clarity & Care
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#424755'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#727786'
  outline-variant: '#c2c6d7'
  surface-tint: '#0059c8'
  primary: '#0056c4'
  on-primary: '#ffffff'
  primary-container: '#006df5'
  on-primary-container: '#fefcff'
  inverse-primary: '#afc6ff'
  secondary: '#0059b8'
  on-secondary: '#ffffff'
  secondary-container: '#0071e7'
  on-secondary-container: '#fefcff'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#00429a'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#acc7ff'
  on-secondary-fixed: '#001a40'
  on-secondary-fixed-variant: '#004590'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.03em
  metric-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system establishes a clinical yet deeply empathetic environment designed for rapid, high-stress decision-making on handheld mobile screens. Tailored for healthcare professionals, nurses, and care coordinators, the interface prioritizes immediate legibility, reduced cognitive load, and human warmth. 

The aesthetic blends **Modern Clinical Minimalism** with **Soft Tactile Dimensions**. Visual tension is eliminated through gentle rounded geometry, clear data segregation, and airy powder-blue atmospheric tones. Rather than feeling sterile or institutional, the interface communicates reliability, quiet reassurance, and modern technological precision. High-contrast critical metrics sit comfortably alongside soft pastel status indicators to keep vital patient signals front and center without inducing alarm fatigue.

## Colors
The color architecture uses subtle atmospheric shifts between light powder blues and crisp white surfaces to organize depth and urgency without clutter.

- **Primary Canvas**: Built on `#F4F8FD` (ranging between `#F0F6FF` and `#F6FAFD`), creating a soothing, low-glare backdrop that reduces eye strain in low-light hospital wards.
- **Surfaces**: Crisp `#FFFFFF` is reserved strictly for interactive tiles, elevated clinical cards, and bottom sheets to command focus against the canvas.
- **Brand & Action**: `#1D77FF` serves as the primary actionable anchor, accompanied by the energetic sky-cobalt `#2C85FE` for active toggles and directional highlights. Hero headers and primary action states leverage the smooth directional gradient `linear-gradient(135deg, #1B72E8 0%, #2C85FE 100%)`.
- **Text & Contrast Hierarchy**: Text avoids harsh pure blacks in favor of deeply saturated slates. Primary titles and critical metrics utilize `text-slate-900` (`#0F172A`) or `text-slate-800` (`#1E293B`), while supporting labels, units, and timestamps use `text-slate-500` (`#64748B`). Border structures rely on delicate tinted slates like `#E2E8F0`.
- **Clinical Status Badges**: Urgent data categorization utilizes dual-tone pastel containers paired with high-saturation glyphs and labels:
  - *Critical / High Alert*: Light Coral `#FFF1F2` container with `#E11D48` text.
  - *Stable / Monitored*: Light Emerald `#ECFDF5` container with `#059669` text.
  - *Warning / Fall Risk*: Warm Amber `#FFFBEB` container with `#D97706` text.
  - *Telemetry / Infusion*: Pure Cyan `#ECFEFF` container with `#0891B2` text.

## Typography
Typography is tuned specifically for mobile scanning at arm's length. **Plus Jakarta Sans** provides a warm, modern, and human grotesque foundation with wide apertures that prevent misreading vital bedside metrics. **Inter** is deployed selectively across dense data tables, micro-labels, status chips, and technical inputs to leverage its neutral precision and tabular numeral alignment.

All numbers in telemetry readings, vital metrics, bed numbers, and dosage values must be rendered using tabular lining figures (`font-variant-numeric: tabular-nums`) to ensure instant horizontal scan stability when values fluctuate.

## Layout & Spacing
The layout follows a portrait mobile-first architecture centered on 390px (standard viewport base) with strict adherence to native safe areas.

- **Grid & Margins**: A 4-column fluid mobile grid with 16px (`gutter`) column separation and 20px (`margin`) outer screen margin. Content cards and clinical overview blocks expand edge-to-edge within the margins to maximize tap real estate.
- **Rhythm & Touch Targets**: Spacing increments use an 8pt base grid with a 4pt sub-grid for badge padding and internal micro-spacing. All primary touch targets adhere to a minimum physical bounding box of 48×48px.
- **Reflow & Responsiveness**:
  - *Compact Phone (360px - 414px)*: Single-column stacked cards, full-width action drawers, sticky bottom navigation.
  - *Large Phone / Foldable Folded (415px - 600px)*: Two-column symmetric metric split for vital card headers, maintaining the 20px screen margin.
  - *Tablet / Dual-Pane (601px+)*: Master-detail split with patient bed roster docked on the left (360px fixed) and active patient monitor on the right.

## Elevation & Depth
Depth conveys physical priority and separation of touch surfaces. The system avoids dense black shadows entirely, relying instead on high-radius, ultra-soft blue atmospheric diffusion.

- **Level 0 (Base Canvas)**: Flat `#F4F8FD` background. No elevation.
- **Level 1 (Clinical Cards & Tiles)**: Pure white `#FFFFFF` surface suspended over the canvas with an ambient blue drop shadow: `box-shadow: 0 8px 30px rgba(29, 119, 255, 0.06);`. Border is a subtle 1px hairline tint using `rgba(226, 232, 240, 0.8)`.
- **Level 2 (Active/Pressed Cards & Modals)**: Subtle upward tactile focus: `box-shadow: 0 12px 36px rgba(29, 119, 255, 0.10);`.
- **Level 3 (Floating Action & Bottom Nav)**: `box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(29, 119, 255, 0.12);`. The iOS bottom navigation bar leverages background blur (`backdrop-filter: blur(20px)`) over an 85% translucent white fill (`rgba(255, 255, 255, 0.85)`).

## Shapes
The shape language uses hyper-rounded curves to foster an approachable, non-threatening atmosphere that softens clinical interactions:

- **Bed Cards & Containers**: Scaled to `rounded-2xl` (16px) for interior operational pods and nested units, and `rounded-3xl` (24px) for major card modules and bottom-sheet surfaces.
- **Action Buttons & Chips**: Fully circular or pill-shaped (`rounded-full` / 9999px) to preserve ergonomic, thumb-friendly tap footprints.
- **Micro-Indicators & Avatars**: Profile initials and status pips use concentric pill shapes or complete circular framing to contrast with rectangular clinical monitors.

## Components

### Buttons
- **Primary**: Pill-shaped (`rounded-full`), carrying the vibrant hero gradient (`linear-gradient(135deg, #1B72E8 0%, #2C85FE 100%)`), white bold typography, and an interactive micro-press state that scales to `0.98`. Height is standardized at 48px or 52px for primary screen CTAs.
- **Secondary / Ghost**: Pure white background, 1px border (`#E2E8F0`), slate-700 text, resting on a soft blue glow upon press.

### Status Chips & Badges
- Pill-shaped (`rounded-full`), 24px to 28px height, combining soft pastel background fills (Coral, Cyan, Amber, Emerald) with high-contrast text and a left-aligned 6px status dot. Typography uses `label-md` in Inter.

### Patient & Bed Cards
- Rendered in pure `#FFFFFF` with `rounded-3xl` (24px) corners, padded with 16px to 20px internal spacing. Contains a dedicated top header row with patient initials avatar, bed assignment badge (e.g., "Bed 04-B"), and triage priority indicator. Center body displays real-time telemetry stats (Heart Rate, SpO2, Blood Pressure) organized in a clean 3-column micro-grid with `metric-display` numbers.

### List Items & Toggles
- Bedside task lists use 60px minimum row heights, full-bleed touch targets with subtle divider lines (`#F1F5F9`). Checkboxes and radio buttons feature custom 22px pill/circle hit zones with deep `#1D77FF` fills and crisp white verification checks.

### Input Fields
- Enclosed in `rounded-2xl` containers with `#FFFFFF` background, a 1.5px border transitioning from neutral `#E2E8F0` to focused `#1D77FF`, accompanied by a subtle 3px outer ring of `rgba(29, 119, 255, 0.15)`.

### Bottom Navigation Bar
- Floats docked above the iOS home indicator with 85% translucent white blur, featuring 4 to 5 core operational destinations (Beds, Vitals, Alerts, Tasks, Team). Active items render in `#1D77FF` with a pill-shaped indicator dot directly beneath the icon.