# Pricing Tabs

## Metadata
- Name: Pricing Tabs
- Category: Navigation
- Status: Stable

## Overview
Switches between per-kg and per-item pricing.
Do not use for multi-step flows.

## Anatomy
- Tab container
- Tab items
- Pricing panel grid

## Tokens used
- `--color-brand-08`
- `--color-brand-strong`
- `--color-surface`
- `--radius-pill`
- `--space-*`

## Props/API
- Tabs: `data-tab="kg"`, `data-tab="item"`

## States
- Default
- Active

## Code example
```html
<div class="pricing-tabs" data-tabs>
  <button class="tab active" data-tab="kg">Per Kg</button>
  <button class="tab" data-tab="item">Per Item</button>
</div>
```

## Cross-references
- Card
