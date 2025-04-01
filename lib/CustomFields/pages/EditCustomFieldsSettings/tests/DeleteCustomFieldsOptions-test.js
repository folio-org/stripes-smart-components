import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';

import sinon from 'sinon';

import {
  runAxeTest,
  MultiColumnList,
  Modal,
  converge,
  including
} from '@folio/stripes-testing';

import {
  setupApplication,
  mount,
} from '../../../../../tests/helpers';

import EditCustomFieldsSettings from '../EditCustomFieldsSettings';
import {
  CustomFieldsFormInteractor,
  CFAccordionInteractor,
  CFDeleteModalInteractor,
  CFSettingsRowInteractor,
} from '../../../tests/interactors';

const getMultiSelectCustomFieldData = options => ({
  id: '5',
  name: 'MSCF',
  refId: 'ms_1',
  type: 'MULTI_SELECT_DROPDOWN',
  entityType: 'user',
  visible: true,
  required: false,
  order: 5,
  helpText: '',
  selectField: {
    multiSelect: true,
    options: { values: options },
  }
});

const renderComponent = (props = {}) => {
  return mount(<EditCustomFieldsSettings
    backendModuleName="users-test"
    entityType="user"
    permissions={{
      canView: true,
      canEdit: true,
      canDelete: true,
    }}
    viewRoute="/custom-fields-view"
    {...props}
  />);
};

describe('delete custom fields options functionality', () => {
  setupApplication();
  const updateCustomFieldsHandler = sinon.spy();
  const accordion = CFAccordionInteractor();
  const deleteModal = CFDeleteModalInteractor();
  const form = CustomFieldsFormInteractor();

  beforeEach(function () {
    this.server.put('/custom-fields', updateCustomFieldsHandler);
    updateCustomFieldsHandler.resetHistory();
  });

  describe('when there is a custom field with unused options', () => {
    beforeEach(async function () {
      const multiselectCustomField = getMultiSelectCustomFieldData([{
        'id': 'opt_0',
        'value': 'option 1',
        'default': true,
      }, {
        'id': 'opt_1',
        'value': 'option 2',
        'default': false,
      }]);

      this.server.get('/custom-fields', () => ({
        customFields: [multiselectCustomField],
      }));

      this.server.get('/custom-fields/:customFieldId/options/:optionId/stats', (_schema, req) => {
        const {
          optionId,
          customFieldId,
        } = req.params;

        return {
          optionId,
          customFieldId,
          entityType: 'user',
          count: 0
        };
      });
      await renderComponent();
      await CFAccordionInteractor({ label: including('MSCF'), open: false }).clickHeader();
    });

    it.skip('should not have any a11y issues', () => runAxeTest());

    it('should not display the option delete buttons since there are only 2 options', () => accordion.has({ deleteButtonCount: 0 }));

    describe('and a new option was added', async () => {
      beforeEach(async () => {
        await accordion.addOption();
        await CFSettingsRowInteractor({ index: 2 }).fillLabel('nice option');
      });

      it.skip('should not have any a11y issues', () => runAxeTest());

      it('should display the option delete buttons', () => accordion.has({ deleteButtonCount: 3 }));

      describe('and the unsaved option was removed', () => {
        beforeEach(async () => {
          await CFSettingsRowInteractor({ index: 2 }).clickTrash();
        });

        it('should hide the delete buttons', () => accordion.has({ deleteButtonCount: 0 }));

        describe('and save button was clicked', () => {
          beforeEach(async () => {
            await accordion.fillHelpText('Some text');
            await form.clickSave();
          });

          it('should save custom fields', () => converge(() => { if (!updateCustomFieldsHandler.calledOnce) throw new Error('updateCustomFieldsHandler not called'); }));
        });
      });

      describe('and an option that was previously saved was removed', () => {
        beforeEach(async () => {
          await accordion.deleteOption(0);
          await CFSettingsRowInteractor({ index: 0 }).fillLabel('asdasdasd');
        });

        it('should hide the option delete buttons', () => accordion.has({ deleteButtonCount: 0 }));

        describe('and the save button was clicked', () => {
          beforeEach(async () => {
            await form.clickSave();
          });

          it('should display the confirmation modal', () => Modal().exists());

          it('should display an option deletion warning in the modal', () => deleteModal.has({ warningCount: 1 }));

          describe('and the cancel button was clicked', () => {
            beforeEach(async () => {
              await deleteModal.clickCancel();
            });

            it('should hide the confirmation modal', () => deleteModal.absent());

            it('should restore the option that was removed', () => MultiColumnList().has({ rowCount: 3 }));
          });
        });

        describe('and the custom field was removed', () => {
          beforeEach(async () => {
            await accordion.deleteCustomField();
          });

          describe('and the save button was clicked', () => {
            beforeEach(async () => {
              await form.clickSave();
            });

            it('should not display an option deletion warning in the modal', () => deleteModal.has({ warningCount: 0 }));

            it('should display a custom field deletion warning in the modal', () => () => deleteModal.has({ warningCount: 1 }));

            describe('and the cancel button was clicked', () => {
              beforeEach(async () => {
                await deleteModal.clickCancel();
              });

              it('should hide the confirmation modal', () => deleteModal.absent());

              it('should restore the custom field that was removed', () => accordion.exists());

              it('should restore the option that was removed', () => accordion.find(MultiColumnList()).has({ rowCount: 3 }));
            });
          });
        });
      });
    });
  });

  describe('when there is a custom field with used options', () => {
    beforeEach(async function () {
      const multiselectCustomField = getMultiSelectCustomFieldData([{
        'id': 'opt_0',
        'value': 'option 1',
        'default': true,
      }, {
        'id': 'opt_1',
        'value': 'option 2',
        'default': false,
      }, {
        'id': 'opt_2',
        'value': 'option 3',
        'default': false,
      }]);

      this.server.get('/custom-fields', () => ({
        customFields: [multiselectCustomField],
      }));

      this.server.get('/custom-fields/:customFieldId/options/:optionId/stats', (_schema, req) => {
        const {
          optionId,
          customFieldId,
        } = req.params;

        return {
          optionId,
          customFieldId,
          entityType: 'user',
          count: 2
        };
      });

      renderComponent();
    });

    it('should hide the option delete buttons', () => accordion.has({ deleteButtonCount: 0 }));
  });
});
