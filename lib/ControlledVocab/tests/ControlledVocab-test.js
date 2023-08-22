import {
  describe,
  beforeEach,
  it,
} from 'mocha';

import {
  Modal,
  ConfirmationModal,
  EditableList,
  EditableListRow,
  ColumnHeader,
  TextField,
  Button,
  including
} from '@folio/stripes-testing';

import mountComponent from './mountComponent';

import { setupApplication } from '../../../tests/helpers';

describe('ControlledVocab', () => {
  const cv = EditableList();
  const firstRow = EditableListRow();
  const cm = ConfirmationModal();
  const mo = Modal();

  const translations = {
    cannotDeleteTermHeader: 'Cannot delete patron group',
    cannotDeleteTermMessage: 'This patron group cannot be deleted, as it is in use by one or more records.',
    deleteEntry: 'Delete patron group',
    termDeleted: 'The patron group <b>{term}</b> was successfully <b>deleted</b>',
    termWillBeDeleted: 'The patron group <b>{term}</b> will be <b>deleted.</b>'
  };

  const labelSingular = 'Institution';
  const listSuppressor = () => false;

  describe('render CV when translations prop is provided', () => {
    setupApplication();

    // eslint-disable-next-line no-undef
    beforeEach(() => mountComponent(true, server, { translations }));

    it('should have row count 5', () => cv.has({ rowCount: 5 }));

    describe('clicking Delete icon on first row', () => {
      beforeEach(async () => {
        await firstRow.delete();
      });

      it('confirmation modal exist ', () => cm.exists());

      it('confirmation modal header title', () => cm.has({ title: 'Delete patron group' }));

      it('should display Delete button', () => cm.find(Button('Delete')).exists());

      describe('click delete on confirmation modal', () => {
        beforeEach(async () => {
          await Button('Delete').click();
        });

        it('cannot delete modal to be shown', () => mo.exists());

        it('cannot delete modal title', () => mo.has({ title: 'Cannot delete patron group' }));
      });
    });
  });

  describe('render CV when translations prop is not provided and labelSingular is provided', () => {
    setupApplication();

    // eslint-disable-next-line no-undef
    beforeEach(() => mountComponent(true, server, { labelSingular }));

    it('should have row count 5', () => cv.has({ rowCount: 5 }));

    describe('clicking Delete icon on first row', () => {
      beforeEach(async () => {
        await firstRow.delete();
      });

      it('confirmation modal exist ', () => cm.exists());

      it('confirmation modal header title', () => cm.has({ title: 'Delete Institution' }));

      it('should display Delete button', () => cm.find(Button('Delete')).exists());

      describe('click delete on confirmation modal', () => {
        beforeEach(async () => {
          await Button('Delete').click();
        });

        it('cannot delete modal to be shown', () => mo.exists());

        it('cannot delete modal title', () => mo.has({ title: 'Cannot delete Institution' }));
      });
    });
  });

  describe('User can edit EditableListForm', () => {
    setupApplication();

    // eslint-disable-next-line no-undef
    beforeEach(() => mountComponent(true, server, { labelSingular }));

    describe('clicking New button', () => {
      beforeEach(async () => {
        await cv.add('new');
      });

      it('should disable New button', () => cv.has({ addDisabled: true }));

      it('should disable Edit button', () => cv.has({ editDisabled: true }));

      it('should disable Delete button', () => cv.has({ deleteDisabled: true }));

      it('should display input field', () => TextField().exists());

      it('should disable Save button', () => firstRow.has({ saveDisabled: true }));

      it('should display Cancel button', () => firstRow.find(Button('Cancel')).exists());

      describe('clicking Cancel button', () => {
        beforeEach(async () => {
          await firstRow.cancel();
        });

        it('should enable New button', () => {
          cv.has({ newDisabled: false });
        });

        it('should enable Edit button', () => {
          cv.has({ editDisabled: false });
        });

        it('should enable Delete button', () => {
          cv.has({ deleteDisableded: false });
        });
      });
    });

    describe('clicking New button', () => {
      beforeEach(async () => {
        await cv.add('New');
      });

      describe('when blurring the input field', () => {
        beforeEach(async () => {
          await firstRow.find(TextField(including('name'))).fillIn('');
        });

        it('should display the error message', () => {
          firstRow.find(TextField(including('name'))).has({ error: true });
        });
      });

      describe('when focusing on the input field', () => {
        beforeEach(async () => {
          await firstRow.find(TextField(including('name'))).fillIn('test');
        });

        // eslint-disable-next-line
        it('should not display the error message', () => firstRow.find(TextField(including('name'))).is({ valid: true }));

        it('should enable Save button', () => firstRow.has({ saveDisabled: false }));
      });
    });

    describe('clicking Edit icon', () => {
      beforeEach(async () => {
        await firstRow.edit();
      });

      it('should disable New button', () => cv.has({ addDisabled: true }));

      it('should disable Edit button', () => cv.has({ editDisabled: true }));

      it('should disable Delete button', () => cv.has({ deleteDisabled: true }));

      it('should display input field', () => TextField().exists());

      it('should disable Save button', () => firstRow.has({ saveDisabled: true }));

      it('should display Cancel button', () => firstRow.find(Button('Cancel')).exists());

      it('should not display Edit icon', () => firstRow.find(Button({ icon: 'edit' })).absent());

      describe('clicking Cancel button', () => {
        beforeEach(async () => {
          await firstRow.cancel();
        });

        it('should enable New button', () => cv.has({ addDisabled: false }));

        it('should display Edit icon', () => firstRow.find(Button({ icon: 'edit' })).exists());

        it('should enable Delete button', () => cv.has({ deleteDisabled: false }));
      });
    });
  });

  describe('User can edit EditableListForm', () => {
    setupApplication();

    // eslint-disable-next-line no-undef
    beforeEach(() => mountComponent(false, server, { labelSingular }));

    it('should not render New button', () => cv.has({ addButton: false }));

    it('should not render edit button', () => cv.has({ editButtons: false }));

    it('should not render delete button', () => cv.has({ deleteButtons: false }));

    it('should render actions column', () => cv.find(ColumnHeader('Actions')).absent());

    it('should render input field column', () => EditableListRow().find(TextField('name')).absent());

    it('should render save button', () => firstRow.find(Button('Save')).absent());

    it('should render cancel button', () => firstRow.find(Button('Cancel')).absent());
  });

  describe('render CV when personal object of user details does not exist', () => {
    setupApplication();

    beforeEach(async () => {
      // eslint-disable-next-line no-undef
      await mountComponent(false, server, { listSuppressor });
    });

    it('should have row count 5', () => cv.has({ rowCount: 5 }));
  });
});
