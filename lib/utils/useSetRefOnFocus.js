import { useState, useLayoutEffect } from 'react';

export function useSetRefOnFocus(focusRef) {
  const [nodes] = useState(new Set());

  const registerElement = element => nodes.add(element);

  const handleFocus = () => {
    if (nodes.has(document.activeElement)) {
      if (typeof focusRef === 'object') focusRef.current = document.activeElement;
      if (typeof focusRef === 'function') focusRef(document.activeElement);
    }
  };

  useLayoutEffect(
    () => {
      // to catch the initial focus on page load
      handleFocus();

      window.addEventListener('focus', handleFocus, { capture: true });

      return () => window.removeEventListener('focus', handleFocus, { capture: true });
    },
    [handleFocus],
  );

  return registerElement;
}

export default useSetRefOnFocus;
