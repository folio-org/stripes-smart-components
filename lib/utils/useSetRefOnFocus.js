import { useState, useLayoutEffect } from 'react';

import { useSetRef } from './useSetRef';

export function useSetRefOnFocus(focusRef) {
  const [nodes] = useState(new Set());
  const setFocusRef = useSetRef(focusRef);

  const registerElement = element => nodes.add(element);

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
