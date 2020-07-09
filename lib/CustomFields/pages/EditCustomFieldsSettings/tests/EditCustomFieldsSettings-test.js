import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { mount, setupApplication } from '../../../../../tests/helpers';

import EditCustomFieldsSettings from '../EditCustomFieldsSettings';
import EditCustomFieldsSettingsInteractor from './interactor';

describe('EditCustomFieldsSettings', () => {
  setupApplication();

  const editCustomFields = new EditCustomFieldsSettingsInteractor();
  const updateCustomFieldsHandler = sinon.spy();

  const renderComponent = (props = {}) => {
    return mount(
      <EditCustomFieldsSettings
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
    );
  };

  beforeEach(async function () {
    this.server.put('/custom-fields', updateCustomFieldsHandler);

    this.server.put('/configurations/entries/tested-custom-field-label', () => ({}));

    await renderComponent();

    updateCustomFieldsHandler.resetHistory();
  });

  it('should show correct section title', () => {
    expect(editCustomFields.sectionTitleValue).to.equal('Custom Fields Test');
  });

  describe('when editing section title', () => {
    beforeEach(async () => {
      await editCustomFields.sectionTitleFillAndBlur('New title');
    });

    it('should enable Save button', () => {
      expect(editCustomFields.saveButtonDisabled).to.be.false;
    });

    it('should enable Cancel button', () => {
      expect(editCustomFields.cancelButtonDisabled).to.be.false;
    });

    describe('and clicking Cancel', () => {
      beforeEach(async () => {
        await editCustomFields.cancel();
      });

      it('should revert changes', () => {
        expect(editCustomFields.sectionTitleValue).to.equal('Custom Fields Test');
      });
    });

    describe('and clicking Save', () => {
      describe('and requests succeed', () => {
        beforeEach(async () => {
          await editCustomFields.save();
        });

        it('should show new title', () => {
          expect(editCustomFields.sectionTitleValue).to.equal('New title');
        });

        it('should redirect to view route', function () {
          expect(this.location.pathname).to.equal('/custom-fields-view');
        });
      });

      describe('and requests fail', () => {
        beforeEach(async function () {
          this.server.put('/custom-fields', {}, 500);

          this.server.put('/configurations/entries/tested-custom-field-label', {}, 500);

          await editCustomFields.save();
        });

        it('should show error message toast', () => {
          // eslint-disable-next-line max-len
          expect(editCustomFields.errorMessage).to.equal('Unable to update due to a module error. Please try again. If problem persists please contact your system administrator.');
        });
      });
    });
  });

  describe('when deleting a custom field', () => {
    describe('and it is not saved', () => {
      beforeEach(async () => {
        await editCustomFields.addFieldButton.selectCustomFieldType(0);
        await editCustomFields.customFields(5).delete();
      });

      it('should not show Delete modal', () => {
        expect(editCustomFields.deleteModal.modalIsPresent).to.be.false;
      });
    });

    describe('and it is saved', () => {
      beforeEach(async () => {
        await editCustomFields.customFields(0).delete();
        await editCustomFields.save();
      });

      it('should show Delete modal', () => {
        expect(editCustomFields.deleteModal.modalIsPresent).to.be.true;
      });

      describe('and when delete is cancelled', () => {
        beforeEach(async () => {
          await editCustomFields.deleteModal.cancelButton.click();
        });

        it('should not remove this custom field', () => {
          expect(editCustomFields.customFields().length).to.equal(5);
        });
      });

      describe('and when delete is confirmed', () => {
        beforeEach(async () => {
          await editCustomFields.deleteModal.confirmButton.click();
        });

        it('should remove this custom field', () => {
          expect(editCustomFields.customFields().length).to.equal(4);
        });
      });
    });
  });

  describe('when creating a custom field with options', () => {
    beforeEach(async () => {
      await editCustomFields.addFieldButton.selectCustomFieldType(1);
      await editCustomFields.customFields(5).fillName('Test field');
      await editCustomFields.customFields(5).options(0).fillOptionName('beta');
      await editCustomFields.customFields(5).options(1).fillOptionName('alpha');
      await editCustomFields.save();
    });

    it('should send correct new custom field data', () => {
      const body = JSON.parse(updateCustomFieldsHandler.args[0][1].requestBody);

      const {
        name,
        selectField,
      } = body.customFields[5];

      expect({ name, selectField }).to.deep.equal({
        name: 'Test field',
        selectField: {
          multiSelect: true,
          options: {
            values: [
              {
                default: false,
                id: 'opt_1',
                value: 'alpha',
              },
              {
                default: false,
                id: 'opt_0',
                value: 'beta',
              },
            ],
          },
        },
      });
    });
  });

  describe('when there is a custom field with unused options', () => {
    beforeEach(async function () {
      this.server.get('/custom-fields', () => ({
        customFields: [{
          'id': '5',
          'name': 'Radio',
          'refId': 'radio_1',
          'type': 'MULTI_SELECT_DROPDOWN',
          'entityType': 'user',
          'visible': true,
          'required': false,
          'order': 5,
          'helpText': '',
          'selectField': {
            'multiSelect': true,
            'options': {
              'values': [{
                'id': 'opt_0',
                'value': 'option 1',
                'default': true,
              }, {
                'id': 'opt_1',
                'value': 'option 2',
                'default': false,
              }],
            }
          }
        }],
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
    });

    it('should not display the option delete buttons since there are only 2 options', () => {
      expect(editCustomFields.customFields(0).options(0).deleteButtonIsDisplayed).to.be.false;
      expect(editCustomFields.customFields(0).options(1).deleteButtonIsDisplayed).to.be.false;
    });

    describe('and a new option was added', async () => {
      beforeEach(async () => {
        await editCustomFields.customFields(0).addOption();
        await editCustomFields.customFields(0).options(2).fillOptionName('nice option');
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
      this.server.get('/custom-fields', () => ({
        customFields: [{
          'id': '5',
          'name': 'Radio',
          'refId': 'radio_1',
          'type': 'MULTI_SELECT_DROPDOWN',
          'entityType': 'user',
          'visible': true,
          'required': false,
          'order': 5,
          'helpText': '',
          'selectField': {
            'multiSelect': true,
            'options': {
              'values': [{
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
              }],
            }
          }
        }],
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

      await renderComponent();
    });

    it('should hide the option delete buttons', () => {
      expect(editCustomFields.customFields(0).options(0).deleteButtonIsDisplayed).to.be.false;
      expect(editCustomFields.customFields(0).options(1).deleteButtonIsDisplayed).to.be.false;
      expect(editCustomFields.customFields(0).options(2).deleteButtonIsDisplayed).to.be.false;
    });
  });
});
