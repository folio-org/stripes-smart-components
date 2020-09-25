import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';
import sinon from 'sinon';

import {
  setupApplication,
  axe,
} from '../../../../../tests/helpers';

import EditCustomFieldsSettings from '../EditCustomFieldsSettings';
import EditCustomFieldsSettingsInteractor from './interactor';

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
  setupApplication({
    component: <EditCustomFieldsSettings
      backendModuleName="users-test"
      entityType="user"
      permissions={{
        canView: true,
        canEdit: true,
        canDelete: true,
      }}
      viewRoute="/custom-fields-view"
      {...props}
    />
  });
};

describe('delete custom fields options functionality', () => {
  renderComponent();
  const updateCustomFieldsHandler = sinon.spy();
  const editCustomFields = new EditCustomFieldsSettingsInteractor();

  let a11yResults = null;

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

      renderComponent();
      await editCustomFields.whenLoaded();

      a11yResults = await axe.run();
    });

    it('should not have any a11y issues', () => {
      expect(a11yResults.violations).to.be.empty;
    });

    it('should not display the option delete buttons since there are only 2 options', () => {
      expect(editCustomFields.customFields(0).options(0).deleteButtonIsDisplayed).to.be.false;
      expect(editCustomFields.customFields(0).options(1).deleteButtonIsDisplayed).to.be.false;
    });

    describe('and a new option was added', async () => {
      beforeEach(async () => {
        await editCustomFields.customFields(0).addOption();
        await editCustomFields.customFields(0).options(2).fillOptionName('nice option');
        a11yResults = await axe.run();
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });

      it('should display the option delete buttons', () => {
        expect(editCustomFields.customFields(0).options(0).deleteButtonIsDisplayed).to.be.true;
        expect(editCustomFields.customFields(0).options(1).deleteButtonIsDisplayed).to.be.true;
        expect(editCustomFields.customFields(0).options(2).deleteButtonIsDisplayed).to.be.true;
      });

      describe('and the unsaved option was removed', () => {
        beforeEach(async () => {
          await editCustomFields.customFields(0).options(2).delete();
        });

        it('should hide the delete buttons', () => {
          expect(editCustomFields.customFields(0).options(0).deleteButtonIsDisplayed).to.be.false;
          expect(editCustomFields.customFields(0).options(1).deleteButtonIsDisplayed).to.be.false;
        });

        describe('and save button was clicked', () => {
          beforeEach(async () => {
            await editCustomFields.customFields(0).fillHelpText('Some text');
            await editCustomFields.save();
          });

          it('should save custom fields', () => {
            expect(updateCustomFieldsHandler.calledOnce).to.be.true;
          });
        });
      });

      describe('and an onption that was previously saved was removed', () => {
        beforeEach(async () => {
          await editCustomFields.customFields(0).options(0).delete();
          await editCustomFields.customFields(0).options(1).fillOptionName('asdasdasd');
        });

        it('should hide the option delete buttons', () => {
          expect(editCustomFields.customFields(0).options(0).deleteButtonIsDisplayed).to.be.false;
          expect(editCustomFields.customFields(0).options(1).deleteButtonIsDisplayed).to.be.false;
        });

        describe('and the save button was clicked', () => {
          beforeEach(async () => {
            await editCustomFields.save();
          });

          it('should display the confirmation modal', () => {
            expect(editCustomFields.deleteModal.modalIsPresent).to.be.true;
          });

          it('should display an option deletion warning in the modal', () => {
            expect(editCustomFields.deleteModal.optionWarningMessages().length).to.equal(1);
          });

          describe('and the cancel button was clicked', () => {
            beforeEach(async () => {
              await editCustomFields.deleteModal.cancelButton.click();
            });

            it('should hide the confirmation modal', () => {
              expect(editCustomFields.deleteModal.modalIsPresent).to.be.false;
            });

            it('should restore the option that was removed', () => {
              expect(editCustomFields.customFields(0).options().length).to.equal(3);
            });
          });
        });

        describe('and the custom field was removed', () => {
          beforeEach(async () => {
            await editCustomFields.customFields(0).delete();
          });

          describe('and the save button was clicked', () => {
            beforeEach(async () => {
              await editCustomFields.save();
            });

            it('should not display an option deletion warning in the modal', () => {
              expect(editCustomFields.deleteModal.optionWarningMessages().length).to.equal(0);
            });

            it('should display a custom field deletion warning in the modal', () => {
              expect(editCustomFields.deleteModal.customFieldsWarningMessages().length).to.equal(1);
            });

            describe('and the cancel button was clicked', () => {
              beforeEach(async () => {
                await editCustomFields.deleteModal.cancelButton.click();
              });

              it('should hide the confirmation modal', () => {
                expect(editCustomFields.deleteModal.modalIsPresent).to.be.false;
              });

              it('should restore the custom field that was removed', () => {
                expect(editCustomFields.customFields().length).to.equal(1);
              });

              it('should restore the option that was removed', () => {
                expect(editCustomFields.customFields(0).options().length).to.equal(3);
              });
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

    it('should hide the option delete buttons', () => {
      expect(editCustomFields.customFields(0).options(0).deleteButtonIsDisplayed).to.be.false;
      expect(editCustomFields.customFields(0).options(1).deleteButtonIsDisplayed).to.be.false;
      expect(editCustomFields.customFields(0).options(2).deleteButtonIsDisplayed).to.be.false;
    });
  });
});
