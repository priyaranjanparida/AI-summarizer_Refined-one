/**
 * ============================================================
 * Button.jsx — Reusable Button Component
 * ============================================================
 *
 * A flexible, variant-based button that forms the foundation
 * of all interactive actions in the app. Instead of writing
 * one-off <button> elements everywhere, we centralise styling
 * logic here so every button in the app looks consistent.
 *
 * VARIANTS:
 *   • 'primary'   — Bold, high-contrast call-to-action (e.g. "Summarize")
 *   • 'secondary' — Default, neutral button for general actions
 *   • 'ghost'     — Transparent / minimal for low-emphasis actions
 *   • 'danger'    — Red-toned button for destructive actions (e.g. "Delete")
 *
 * CSS STRATEGY:
 *   We use BEM-style classes: `.btn` is the base, `.btn--primary`
 *   is the modifier. The actual styles live in a separate CSS file —
 *   this component only references class names, never inline styles.
 *
 * USAGE:
 *   <Button variant="primary" onClick={handleClick}>
 *     Submit
 *   </Button>
 *
 *   <Button variant="danger" disabled>
 *     Delete Account
 *   </Button>
 * ============================================================
 */

import React from 'react';

/**
 * Button — a styled, accessible <button> element.
 *
 * @param {Object}  props
 * @param {string}  [props.variant='secondary'] — Visual style variant
 * @param {string}  [props.className]           — Extra CSS classes to merge in
 * @param {boolean} [props.disabled]            — Disables interaction & greys out
 * @param {React.ReactNode} props.children      — Button label / contents
 * @param {Object}  props.rest                  — Any other native button props (onClick, type, etc.)
 */
const Button = ({
  variant = 'secondary',
  children,
  className = '',
  disabled = false,
  ...rest
}) => {
  /* ------------------------------------------------------------------
   * Build the class string
   * ------------------------------------------------------------------
   * Base class: `btn`                 → shared reset + padding + cursor
   * Modifier:   `btn--{variant}`      → colour / background per variant
   * Extra:      whatever the parent passes via `className`
   * ------------------------------------------------------------------ */
  const classes = [
    'btn',                   // Base styles for every button
    `btn--${variant}`,       // Variant-specific modifier
    className,               // Any extra classes from the parent component
  ]
    .filter(Boolean)         // Remove empty strings so we don't get extra spaces
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      {...rest}               /* Spread remaining props: onClick, type, aria-*, etc. */
    >
      {children}
    </button>
  );
};

export default Button;
