import React from 'react';
import {
  describe,
  after,
  before,
  beforeEach,
  it,
} from 'mocha';

import {
  HTML,
  Callout
} from '@folio/stripes-testing';

import { mount, setupApplication } from '../../../tests/helpers';
import CalloutHarness from '../../../tests/CalloutHarness';
import ClipCopy from '../ClipCopy';

const ClipCopyInteractor = HTML.extend('ClipCopy')
  .selector('span[data-test-copy-icon=true]')
  .filters({
    clipboard: el => Boolean(el.querySelector('svg')),
  })
  .actions({
    clickClipboard: ({ perform }) => perform(el => el.querySelector('button').click()),
  });

const ClipCopyMock = props => (
  <CalloutHarness>
    <ClipCopy {...props} />
  </CalloutHarness>
);

describe('ClipCopy', () => {
  let tempPrompt;
  before(async () => {
    await setupApplication();

    // replace window.prompt triggered by the clipboard library
    tempPrompt = window.prompt;
    window.prompt = () => {};
  });

  beforeEach(async () => {
    await mount(<ClipCopyMock text="some text" />);
  });

  it('shows a clipboard icon', () => ClipCopyInteractor().has({ clipboard: true }));
  describe('Clicking ClipCopy', () => {
    beforeEach(async () => {
      await ClipCopyInteractor().clickClipboard();
    });

    it('clicking clipboard shows success toast', () => Callout({ type: 'success' }).exists());
  });

  after(() => {
    // put original prompt functionality back.
    window.prompt = tempPrompt;
  });
});
