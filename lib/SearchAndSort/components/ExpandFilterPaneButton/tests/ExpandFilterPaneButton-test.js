/**
 * ExpandFilterPaneButton tests
 */

import React from 'react';
import { describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import TooltipInteractor from '@folio/stripes-components/lib/Tooltip/tests/interactor';
import ExpandFilterPaneButtonInteractor from './interactor';
import IntlHarness from '../../../../../tests/IntlHarness';
import { setupApplication } from '../../../../../tests/helpers';
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
    setupApplication({
      component: (
        <ExpandFilterPaneButtonMock
          onClick={() => { clicked = true; }}
        />
      )
    });

    it('should trigger onClick callback', () => {
      expandFilterPaneButton.click().then(() => {
        expect(clicked).to.be.true;
      });
    });
  });

  describe('Focusing a ExpandFilterPaneButton with a filterCount', () => {
    setupApplication({
      component: (
        <ExpandFilterPaneButtonMock
          filterCount={10}
        />
      )
    });

    it('should show a tooltip with a sub', () => {
      expandFilterPaneButton.focus().then(() => {
        expect(tooltip.hasSub).to.be.true;
      });
    });
  });
});
