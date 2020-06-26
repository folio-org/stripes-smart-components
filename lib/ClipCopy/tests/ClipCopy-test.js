import React from 'react';
import { expect } from 'chai';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';

import { mount, setupApplication } from '../../../tests/helpers';
import CalloutHarness from '../../../tests/CalloutHarness';
import ClipCopyInteractor from './interactor';
import ClipCopy from '../ClipCopy';

//
// this doesn't work. I don't get it.
//

const ClipCopyMock = props => (
  <CalloutHarness>
    <ClipCopy {...props} />
  </CalloutHarness>
);

describe('ClipCopy', () => {
  const cc = new ClipCopyInteractor();

  beforeEach(async () => {
    await mount(<ClipCopyMock text="some text" />);
    await cc.clickClipboard();
  });

  it('Shows a clipboard icon', () => {
    expect(cc.hasClipboard).to.be.true;
  });

  it('Clicking clipboard shows success toast', () => {
    expect(cc.toast.successCalloutIsPresent).to.be.true;
  });
});
