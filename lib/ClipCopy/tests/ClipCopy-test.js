import React from 'react';
import { expect } from 'chai';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';

import { setupApplication } from '../../../tests/helpers';
import CalloutHarness from '../../../tests/CalloutHarness';
import ClipCopyInteractor from './interactor';
import ClipCopy from '../ClipCopy';

const ClipCopyMock = props => (
  <CalloutHarness>
    <ClipCopy {...props} />
  </CalloutHarness>
);

//
// this should work, but it doesn't, and I give up.
// I can run
//    expect(cc.hasClipboard).to.be.true;
// five times in a row and it'll only succeed the last four. Huh?
//
// I give up. This is a simple component that I tried hard to test,
// but I just can't get tests to work.
//

describe('ClipCopy', () => {
  const cc = new ClipCopyInteractor();

  setupApplication({
    component: <ClipCopyMock text="some text" />
  });

  it('shows a clipboard icon', async () => {
    await expect(cc.hasClipboard).to.be.true;
  });

  describe('ClipCopy', () => {
    beforeEach(async () => {
      await cc.clickClipboard();
    });

    it.skip('clicking clipboard shows success toast', () => {
      expect(cc.toast.successCalloutIsPresent).to.be.true;
    });
  });
});
