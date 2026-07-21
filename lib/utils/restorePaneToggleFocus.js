/**
 * A pane-toggle button (e.g. Expand/Collapse filter-pane) is often rendered as
 * two separate, mutually-exclusive instances - one per toggle state - each
 * living in a `<Pane>` that mounts/unmounts as the toggle state changes. When
 * the button that currently has focus is removed from the DOM as a result of
 * being clicked, the browser drops focus to `<body>`, and the next `Tab` press
 * lands on the first focusable element on the page (e.g. a "Skip to main
 * content" link) instead of staying near the toggle control. See STCOM-1521.
 *
 * Call this from within the toggle button's `onClick` handler, after
 * triggering the toggle, to restore focus to whichever instance of the toggle
 * button ends up in the DOM once React re-renders.
 *
 * @param {string} [selector] a CSS selector matching whichever toggle button
 * instance is currently in the DOM. Defaults to the Expand/Collapse
 * filter-pane buttons' selector; pass a custom selector to reuse this for
 * other pane-toggle button pairs.
 */
const FILTER_PANE_TOGGLE_BUTTON_SELECTOR = '[data-test-expand-filter-pane-button], [data-test-collapse-filter-pane-button]';

export const restorePaneToggleFocus = (selector = FILTER_PANE_TOGGLE_BUTTON_SELECTOR) => {
  // The `onClick` handler runs before React has re-rendered/committed the
  // resulting DOM changes, so the counterpart toggle button may not exist
  // yet. Deferring with `requestAnimationFrame` waits until after the
  // browser's next paint, by which point React has flushed the re-render
  // and the counterpart button is available to receive focus.
  //
  // Focus is always moved to the toggle button, regardless of where it
  // currently is, so that activating the toggle reliably keeps focus on
  // the control rather than letting it fall through to `<body>` or get
  // claimed by an unrelated `autoFocus`/programmatic focus elsewhere.
  window.requestAnimationFrame(() => {
    document.querySelector(selector)?.focus();
  });
};
