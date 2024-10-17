import { useState } from 'react';

const usePrevious = (value, defaultValue) => {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(defaultValue);

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
};

export default usePrevious;

