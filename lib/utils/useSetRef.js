import { useCallback } from 'react';

export const useSetRef = ref => useCallback(element => {
  if (typeof ref === 'object') ref.current = element;
  if (typeof ref === 'function') ref(element);
}, [ref]);

export default useSetRef;
