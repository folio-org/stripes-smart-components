/**
 * ExpandFilterPaneButton tests
 */

import React from 'react';
import { describe, it } from 'mocha';
import {
  Button,
  Tooltip,
  including,
  converge
} from '@folio/stripes-testing';

import IntlHarness from '../../../../../tests/IntlHarness';
import { setupApplication } from '../../../../../tests/helpers';
import ExpandFilterPaneButton from '../ExpandFilterPaneButton';

const ExpandFilterPaneButtonMock = props => (
  <IntlHarness>
    <ExpandFilterPaneButton {...props} />
  </IntlHarness>
);

describe('ExpandFilterPaneButton', () => {
  describe('Clicking ExpandFilterPaneButton', () => {
    let clicked = false;
    setupApplication({
      component: (
        <ExpandFilterPaneButtonMock
          onClick={() => { clicked = true; }}
        />
      )
    });

    beforeEach(async () => {
      await Button({ ariaLabel: 'caret-right' }).click();
    });

    it('should trigger onClick callback', () => converge(() => { if (!clicked) throw new Error('expected clicked to be true'); }));
  });

  describe('Focusing a ExpandFilterPaneButton with a filterCount', () => {
    setupApplication({
      component: (
        <ExpandFilterPaneButtonMock
          filterCount={10}
        />
      )
    });

    beforeEach(async () => {
      await Button({ ariaLabel: 'caret-right' }).focus();
    });

    it('should show a tooltip with a sub', () => Tooltip({ subtext: including('number') }).exists());
  });
});
