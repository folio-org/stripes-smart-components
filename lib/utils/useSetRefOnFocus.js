import { useState, useCallback, useLayoutEffect } from 'react';

export function useSetRefOnFocus(focusRef) {
  const [nodes] = useState(new Set());

  const setFocusRef = useCallback(element => {
    if (typeof focusRef === 'object') focusRef.current = element;
    if (typeof focusRef === 'function') focusRef(element);
  }, [focusRef]);

  const registerElement = element => nodes.add(element);

  registerElement.default = element => {
    if (!nodes.has(element)) setFocusRef(element);
    registerElement(element);
  };

  useLayoutEffect(
    () => {
      const handleFocus = () => nodes.has(document.activeElement) && setFocusRef(document.activeElement);

      // to catch the initial focus on page load
      handleFocus();

      window.addEventListener('focus', handleFocus, { capture: true });

      return () => window.removeEventListener('focus', handleFocus, { capture: true });
    },
    [setFocusRef, nodes],
  );

  return registerElement;
}

export default useSetRefOnFocus;
