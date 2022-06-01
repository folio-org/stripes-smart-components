/* eslint-disable prefer-arrow-callback */
/**
 * ColumnManager -> Tests
 */

import React from 'react';
import { after, describe, before, beforeEach, it } from '@bigtest/mocha';
import { Interactor } from '@bigtest/interactor';
import { expect } from 'chai';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import { mount, setupApplication } from '../../../tests/helpers';
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
  );
};

describe('ColumnManager', () => {
  setupApplication({
    component: UI
  });

  const columnManager = new ColumnManagerInteractor('#column-manager');
  const usernameColumn = new Interactor('#list-column-username');

  const clearStorage = async () => {
    await sessionStorage.removeItem(`column-manager-${columnManagerId}-storage`);
  };

  before(async () => {
    await clearStorage();
  });

  after(async () => {
    await clearStorage();
  });

  beforeEach(async () => {
    await mount(<UI />);
  });

  describe('Click the username checkbox', () => {
    let isChecked = false;

    beforeEach(async () => {
      if (!isChecked) {
        await columnManager.columnsMenu.checkbox('username').click();
        isChecked = true;
      }
    });

    it('Should uncheck the username checkbox', () => {
      expect(columnManager.columnsMenu.checkbox('username').isChecked).to.be.false;
    });

    it('Should hide the username column', () => {
      expect(usernameColumn.isPresent).to.be.false;
    });
  });

  describe('Running the app again', () => {
    it('Should mount with the username checkbox checked', () => {
      expect(columnManager.columnsMenu.checkbox('username').isChecked).to.be.false;
    });

    it('Should mount with the username column hidden', () => {
      expect(usernameColumn.isPresent).to.be.false;
    });
  });

  describe('Click the username checkbox again', () => {
    let isChecked = false;

    beforeEach(async () => {
      if (!isChecked) {
        await columnManager.columnsMenu.checkbox('username').click();
        isChecked = true;
      }
    });

    it('Should check the username checkbox', () => {
      expect(columnManager.columnsMenu.checkbox('username').isChecked).to.be.true;
    });

    it('Should show the username column again', () => {
      expect(usernameColumn.isPresent).to.be.true;
    });
  });
});
