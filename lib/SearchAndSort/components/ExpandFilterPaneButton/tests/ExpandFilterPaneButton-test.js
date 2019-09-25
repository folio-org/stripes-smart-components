/**
 * ExpandFilterPaneButton tests
 */

import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { mount } from '@bigtest/react';
import { expect } from 'chai';
import TooltipInteractor from '@folio/stripes-components/lib/Tooltip/tests/interactor';
import ExpandFilterPaneButtonInteractor from './interactor';
import IntlHarness from '../../../../../tests/IntlHarness';
import ExpandFilterPaneButton from '../ExpandFilterPaneButton';

const ExpandFilterPaneButtonMock = props => (
  <IntlHarness>
    <ExpandFilterPaneButton {...props} />
  </IntlHarness>
);

describe('ExpandFilterPaneButton', () => {
  const expandFilterPaneButton = new ExpandFilterPaneButtonInteractor();
  const tooltip = new TooltipInteractor();

  describe('Clicking ExpandFilterPaneButton', () => {
    let clicked = false;
    beforeEach(async () => {
      await mount(() => (
        <ExpandFilterPaneButtonMock
          onClick={() => { clicked = true; }}
        />
      ));
      await expandFilterPaneButton.click();
    });
    it('should trigger onClick callback', () => {
      expect(clicked).to.be.true;
    });
  });

  describe('Focusing a ExpandFilterPaneButton with a filterCount', () => {
    beforeEach(async () => {
      await mount(() => (
        <ExpandFilterPaneButtonMock
          filterCount={10}
        />
      ));
      await expandFilterPaneButton.focus();
    });
    it('should show a tooltip with a sub', () => {
      expect(tooltip.hasSub).to.be.true;
    });
  });
});
