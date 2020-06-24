import {
  interactor,
  focusable,
  triggerable,
} from '@bigtest/interactor';

@interactor class DraggableAccordion {
  focus = focusable();

  pressSpace = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 32,
    which: 32,
  });

  pressArrowUp = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 38,
    key: 'ArrowUp',
  });

  pressArrowDown = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 40,
    key: 'ArrowDown',
  });
}

export default DraggableAccordion;
