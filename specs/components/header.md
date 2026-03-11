# Header

## Metadata
- Name: Header
- Category: Navigation
- Status: Stable

## Overview
Use for global site navigation and brand identity.
Do not use inside content sections.

## Anatomy
- Container
- Brand block (logo + text)
- Nav links
- Primary CTA link

## Tokens used
- `--color-overlay-strong`
- `--color-brand-12`
- `--color-brand-08`
- `--color-text`
- `--color-surface`
- `--space-*`
- `--radius-pill`
- `--z-header`

## Props/API
None.

## States
- Default
- Hover (nav links)

## Code example
```html
<header class="site-header">
  <div class="container header-inner">
    <div class="brand">
      <div class="logo"><img src="assets/youclean-logo.svg" alt="YouClean logo" /></div>
      <div class="brand-text">
        <span class="brand-name">YouClean</span>
        <span class="brand-sub">Laundry & Dry Cleaning</span>
      </div>
    </div>
    <nav class="nav">
      <a href="#services">Services</a>
      <a href="#gallery">Gallery</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact" class="nav-cta">Book Pickup</a>
    </nav>
  </div>
</header>
```

## Cross-references
- Button
- Footer
