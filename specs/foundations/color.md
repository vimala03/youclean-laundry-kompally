# Color

## Palette (Layer 1: DS primitives)
- `--ds-color-ink-900`: #0f1d24 (primary text)
- `--ds-color-brand-900`: #003648 (brand deep)
- `--ds-color-brand-700`: #27425b (brand mid)
- `--ds-color-brand-500`: #00d17c (accent)
- `--ds-color-brand-100`: #cfeee0 (mint wash)
- `--ds-color-surface-0`: #ffffff (base surface)
- `--ds-color-surface-50`: #f4f9fd (soft surface)
- `--ds-color-surface-100`: #edf3f7 (muted surface)
- `--ds-color-surface-150`: #e9f6f0 (mint surface)
- `--ds-color-surface-200`: #fffdf8 (warm surface)

## Alpha colors
- `--ds-alpha-ink-20`: rgba(26, 28, 30, 0.2)
- `--ds-alpha-ink-60`: rgba(26, 28, 30, 0.6)
- `--ds-alpha-ink-70`: rgba(26, 28, 30, 0.7)
- `--ds-alpha-ink-78`: rgba(26, 28, 30, 0.78)
- `--ds-alpha-brand-08`: rgba(0, 54, 72, 0.08)
- `--ds-alpha-brand-12`: rgba(20, 63, 75, 0.12)
- `--ds-alpha-brand-18`: rgba(0, 54, 72, 0.18)
- `--ds-alpha-accent-25`: rgba(0, 209, 124, 0.25)
- `--ds-alpha-surface-85`: rgba(255, 255, 255, 0.85)
- `--ds-alpha-surface-92`: rgba(255, 255, 255, 0.92)
- `--ds-alpha-surface-10`: rgba(244, 249, 253, 0.1)
- `--ds-alpha-surface-60`: rgba(244, 249, 253, 0.6)
- `--ds-alpha-fade-0`: rgba(244, 249, 253, 0)
- `--ds-alpha-fade-100`: rgba(244, 249, 253, 1)

## Semantic aliases (Layer 2)
- `--color-text`: primary text
- `--color-text-muted`: body muted
- `--color-text-subtle`: secondary text
- `--color-text-soft`: tertiary text
- `--color-border`: default borders
- `--color-brand-strong`: main brand
- `--color-brand`: supporting brand
- `--color-accent`: primary CTA
- `--color-accent-soft`: accent shadow
- `--color-surface`: base surface
- `--color-surface-soft`: light surface
- `--color-surface-muted`: muted surface
- `--color-surface-warm`: warm surface
- `--color-surface-mint`: mint surface
- `--color-overlay-strong`: sticky header/overlay
- `--color-overlay`: glass card overlay
- `--color-brand-08`: subtle brand fills
- `--color-brand-12`: divider borders
- `--color-brand-18`: strong brand shadows
- `--color-surface-10`: subtle surface wash
- `--color-surface-60`: mid surface wash
- `--color-fade-0`: gradient start
- `--color-fade-100`: gradient end

## Usage rules
1. Never use raw hex or rgba in component styles.
2. Always select a semantic alias token first.
3. Only use DS primitives in `tokens.css`.
