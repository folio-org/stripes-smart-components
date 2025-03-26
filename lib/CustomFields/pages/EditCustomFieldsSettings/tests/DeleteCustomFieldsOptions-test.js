import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';

import sinon from 'sinon';

import {
  runAxeTest,
  Accordion,
  MultiColumnList,
  MultiColumnListRow,
  Button,
  Modal,
  TextField,
  converge,
  including
} from '@folio/stripes-testing';

import {
  setupApplication,
  mount,
} from '../../../../../tests/helpers';

import EditCustomFieldsSettings from '../EditCustomFieldsSettings';

const CustomFieldsAccordionInteractor = Accordion.extend('custom fields accordion')
  .selector('[class^=accordion--]')
  .filters({
    deleteButtonCount: (el) => [...el.querySelector('[class*=content]').querySelectorAll('button[aria-label=trash]')].length,
    index: (el) => {
      // collect elements from document, and sort by dom rect.
      const accordions = [...document.querySelectorAll('[data-test-accordion-section]')];

      accordions.sort((a, b) => {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      });

      for (let i = 0; i < accordions.length; i++) {
        if (el === accordions[i]) {
          return i;
        }
      }

      return undefined;
    },
    count: () => document.querySelectorAll('[data-test-accordion-section]').length,
  })
  .actions({
    clickHeader: async ({ perform }) => { await perform((el) => el.querySelector('[class^=labelArea-]').click()); },
    deleteOption: async ({ find }, index) => { await find(MultiColumnListRow({ index })).find(Button({ ariaLabel: 'trash' })).click(); },
    deleteCustomField: async ({ perform }) => { await perform((el) => el.querySelector('[class^=headerWrapper]').querySelector('button[aria-label=trash]').click()); },
  });

const CustomFieldDeleteModal = Modal.extend('custom field delete modal')
  .filters({
    warningCount: el => [...el.querySelectorAll('[data-test-custom-field-option-delete-warning]')].length
  })
  .actions({
    cancel: ({ find }) => find(Button(including('Cancel'))).click()
  });

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
      await CustomFieldsAccordionInteractor({ label: including('MSCF'), open: false }).clickHeader();
    });

    it.skip('should not have any a11y issues', () => runAxeTest());

    it('should not display the option delete buttons since there are only 2 options', () => CustomFieldsAccordionInteractor().has({ deleteButtonCount: 0 }));

    describe('and a new option was added', async () => {
      beforeEach(async () => {
        await Button('Add option').click();
        await MultiColumnListRow({ index: 2 }).find(TextField()).fillIn('nice option');
      });

      it.skip('should not have any a11y issues', () => runAxeTest());

      it('should display the option delete buttons', () => CustomFieldsAccordionInteractor().has({ deleteButtonCount: 3 }));

      describe('and the unsaved option was removed', () => {
        beforeEach(async () => {
          await MultiColumnListRow({ index: 2 }).find(Button({ ariaLabel: 'trash' })).click();
        });

        it('should hide the delete buttons', () => CustomFieldsAccordionInteractor().has({ deleteButtonCount: 0 }));

        describe('and save button was clicked', () => {
          beforeEach(async () => {
            await TextField('Help text').fillIn('Some text');
            await Button('Save & close').click();
          });

          it('should save custom fields', () => converge(() => { if (!updateCustomFieldsHandler.calledOnce) throw new Error('updateCustomFieldsHandler not called'); }));
        });
      });

      describe('and an option that was previously saved was removed', () => {
        beforeEach(async () => {
          await CustomFieldsAccordionInteractor().deleteOption(0);
          await MultiColumnListRow({ index: 0 }).find(TextField()).fillIn('asdasdasd');
        });

        it('should hide the option delete buttons', () => CustomFieldsAccordionInteractor().has({ deleteButtonCount: 0 }));

        describe('and the save button was clicked', () => {
          beforeEach(async () => {
            await Button('Save & close').click();
          });

          it('should display the confirmation modal', () => Modal().exists());

          it('should display an option deletion warning in the modal', () => CustomFieldDeleteModal({ warningCount: 1 }));

          describe('and the cancel button was clicked', () => {
            beforeEach(async () => {
              await CustomFieldDeleteModal().cancel();
            });

            it('should hide the confirmation modal', () => CustomFieldDeleteModal().absent());

            it('should restore the option that was removed', () => MultiColumnList().has({ rowCount: 3 }));
          });
        });

        describe('and the custom field was removed', () => {
          beforeEach(async () => {
            await CustomFieldsAccordionInteractor().deleteCustomField();
          });

          describe('and the save button was clicked', () => {
            beforeEach(async () => {
              await Button('Save & close').click();
            });

            it('should not display an option deletion warning in the modal', () => CustomFieldDeleteModal({ warningCount: 0 }));

            it('should display a custom field deletion warning in the modal', () => () => CustomFieldDeleteModal({ warningCount: 1 }));

            describe('and the cancel button was clicked', () => {
              beforeEach(async () => {
                await CustomFieldDeleteModal().cancel();
              });

              it('should hide the confirmation modal', () => CustomFieldDeleteModal().absent());

              it('should restore the custom field that was removed', () => CustomFieldsAccordionInteractor().exists());

              it('should restore the option that was removed', () => CustomFieldsAccordionInteractor().find(MultiColumnList()).has({ rowCount: 3 }));
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

    it('should hide the option delete buttons', () => CustomFieldsAccordionInteractor().has({ deleteButtonCount: 0 }));
  });
});
