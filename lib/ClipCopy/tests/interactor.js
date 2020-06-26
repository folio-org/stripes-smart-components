import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor';

export default interactor(class ClipCopyInteractor {
  toast = new CalloutInteractor();
  clickClipboard = clickable('[data-test-copy-icon]');
  hasClipboard = isPresent('[data-test-copy-icon]');
});
