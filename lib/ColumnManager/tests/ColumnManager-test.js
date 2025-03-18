/* eslint-disable prefer-arrow-callback */
/**
 * ColumnManager -> Tests
 */

import React from 'react';
import { after, describe, before, beforeEach, it } from 'mocha';
// import { Interactor } from '@bigtest/interactor';
import { expect } from 'chai';
import {
  Checkbox,
  HTML
} from '@folio/stripes-testing';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import { mount, setupApplication } from '../../../tests/helpers';
import IntlHarness from '../../../tests/IntlHarness';
import ColumnManager from '../ColumnManager';
import ColumnManagerInteractor from './interactor';

const columnManagerId = 'column-manager';
const columnMapping = {
  name: 'name',
  email: 'email',
  username: 'username',
  barcode: 'barcode',
};

const data = [{
  name: 'John Doe',
  email: 'john@doe.com',
  username: 'johndoe',
  barcode: '#123456'
}];

const UI = () => {
  return (
    <IntlHarness>
      <div id="column-manager">
        <ColumnManager columnMapping={columnMapping} id={columnManagerId}>
          {({ visibleColumns, renderColumnsMenu }) => (
            <>
              {renderColumnsMenu}
              <MultiColumnList
                contentData={data}
                visibleColumns={visibleColumns}
              />
            </>
          )}
        </ColumnManager>
      </div>
    </IntlHarness>
  );
};

describe('ColumnManager', () => {
  const clearStorage = async () => {
    await sessionStorage.removeItem(`column-manager-${columnManagerId}-storage`);
  };

  before(async () => {
    setupApplication();
    await clearStorage();
  });

  after(async () => {
    await clearStorage();
  });

  beforeEach(async () => {
    await mount(<UI />);
  });

  describe('Click the username checkbox', () => {
    beforeEach(async () => {
      await Checkbox('username').click();
    });

    // it('Should uncheck the username checkbox', () => Checkbox('username').is({ checked: false }));

    it('Should hide the username column', () => Promise.all([
      Checkbox('username').is({ checked: false }),
      HTML({ id: 'list-column-username' }).absent()
    ]));
  });

  describe('Running the app again', () => {
    it('Should hide the username column', () => Promise.all([
      Checkbox('username').is({ checked: false }),
      HTML({ id: 'list-column-username' }).absent()
    ]));

    describe('Click the username checkbox again', () => {
      before(async () => {
        await Checkbox('username').click();
      });

      it('Should check the username checkbox', () => Promise.all([
        Checkbox('username').is({ checked: true }),
        HTML({ id: 'list-column-username' }).exists()
      ]));
    });
  });
});
