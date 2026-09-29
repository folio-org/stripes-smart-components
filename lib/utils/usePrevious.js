import {
  useRef,
  useEffect,
} from 'react';

const usePrevious = value => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  // eslint-disable-next-line react/refs -- returning the previous render's value requires reading the ref during render
  return ref.current;
};

export default usePrevious;

