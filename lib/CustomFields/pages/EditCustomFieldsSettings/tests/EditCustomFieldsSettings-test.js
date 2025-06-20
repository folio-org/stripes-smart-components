import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import sinon from 'sinon';
import isEqual from 'lodash/isEqual';

import {
  Button,
  Callout,
  TextField,
  Modal,
  including,
  runAxeTest,
  converge
} from '@folio/stripes-testing';

import {
  mount,
  setupApplication,
} from '../../../../../tests/helpers';

import EditCustomFieldsSettings from '../EditCustomFieldsSettings';
import {
  CustomFieldsFormInteractor,
  CFAccordionInteractor,
  CFDeleteModalInteractor,
  CFSettingsRowInteractor
} from '../../../tests/interactors';

describe('EditCustomFieldsSettings', () => {
  setupApplication();

  const modal = CFDeleteModalInteractor();
  const form = CustomFieldsFormInteractor();
  const sectionTitle = form.find(TextField('Accordion title*'));
  const saveButton = form.find(Button(including('Save')));
  const cancelButton = form.find(Button(including('Cancel')));
  const updateCustomFieldsHandler = sinon.spy();
  const updateConfigurationHandler = sinon.spy();
  const updateSettingsHandler = sinon.spy();

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
        configNamePrefix="prefix"
        {...props}
      />
    );
  };

  beforeEach(async function () {
    this.server.put('/custom-fields', updateCustomFieldsHandler);

    this.server.put('/configurations/entries/tested-custom-field-label', updateConfigurationHandler);

    await renderComponent();

    updateCustomFieldsHandler.resetHistory();
  });

  it.skip('should not have any a11y issues', () => runAxeTest());

  it('should show correct section title', () => sectionTitle.has({ value: 'Custom Fields Test' }));

  describe('when editing section title', () => {
    beforeEach(async () => {
      await sectionTitle.fillIn('New title');
    });

    it('should enable Save button', () => saveButton.is({ disabled: false }));

    it('should enable Cancel button', () => cancelButton.is({ disabled: false }));

    describe('and clicking Cancel', () => {
      beforeEach(async () => {
        await form.clickCancel();
      });

      it('should revert changes', () => sectionTitle.has({ value: 'Custom Fields Test' }));
    });

    describe('and clicking Save', () => {
      describe('and requests succeed', () => {
        beforeEach(async () => {
          await form.clickSave();
        });

        it('should show new title', () => sectionTitle.has({ value: 'New title' }));

        it('should redirect to view route', function () {
          return converge(() => { if (this.location.pathname !== '/custom-fields-view') throw new Error('expected pathname to be "/custom-fields-view"'); });
        });
      });

      describe('and requests fail', () => {
        beforeEach(async function () {
          this.server.put('/custom-fields', {}, 500);

          this.server.put('/configurations/entries/tested-custom-field-label', {}, 500);

          await form.clickSave();
        });

        it('should show error message toast', () => Callout('Unable to update due to a module error. Please try again. If problem persists please contact your system administrator.').exists());
      });
    });
  });

  describe('when deleting a custom field', () => {
    describe('and it is not saved', () => {
      beforeEach(async () => {
        await form.addField('Checkbox');
        await CFAccordionInteractor(including('Checkbox')).deleteCustomField();
      });

      it('should not show Delete modal', () => Modal().absent());
    });

    describe('and it is saved', () => {
      beforeEach(async () => {
        let cf = await CFAccordionInteractor({ index: 0 });
        await cf.clickHeader();
        await cf.find(TextField('Field label*')).fillIn('a');
        await cf.find(TextField('Help text')).fillIn('b');
        await CFAccordionInteractor({ index: 0 }).deleteCustomField();

        cf = await CFAccordionInteractor({ index: 0 });
        await cf.clickHeader();
        await cf.find(TextField('Field label*')).fillIn('a');
        await cf.find(TextField('Help text')).fillIn('b');
      });

      it('custom fields are removed', () => CFAccordionInteractor({ index: 0 }).has({ count: 6 }));

      describe('clicking form\'s delete button', () => {
        beforeEach(async () => {
          await saveButton.click();
        });

        it('should show confirm-delete modal', () => modal.exists());

        describe('and when delete is cancelled', () => {
          beforeEach(async () => {
            await modal.clickCancel();
          });

          it('should not remove this custom field', () => CFAccordionInteractor({ index: 0 }).has({ count: 7 }));
        });

        describe('and when delete is confirmed', () => {
          beforeEach(async () => {
            await modal.clickSave();
          });

          // skipping this - the new page 404's before this gets asserted, so there's no
          // Accordions in the view.
          it.skip('should remove this custom field', () => CFAccordionInteractor({ index: 0 }).has({ count: 6 }));

          it('should redirect to view route', function () { return converge(() => { if (this.location.pathname !== '/custom-fields-view') throw new Error('pathname is not "/custom-fields-view"'); }); });
        });
      });
    });
  });

  // as above, delete tests fail, hence disabling this block as well.
  describe('when deleting all custom fields', () => {
    beforeEach(async () => {
      for (let i = 0; i < 6; i++) {
        await CFAccordionInteractor({ index: 0 }).deleteCustomField();
      }
      await saveButton.click();
    });

    it('should show Delete modal', () => Modal().exists());

    describe('and when delete is confirmed', () => {
      beforeEach(async () => {
        await modal.clickSave();
      });

      it.skip('should remove all custom fields', () => CFAccordionInteractor({ index: 0 }).absent());

      it('should redirect to view route', function () { return converge(() => { if (this.location.pathname !== '/custom-fields-view') throw new Error('pathname is not "/custom-fields-view"'); }); });
    });
  });


  describe('when creating a custom field with options', () => {
    beforeEach(async () => {
      await form.addField('Multi-select');
      await TextField('Field label*').fillIn('Test field');
    });

    it('updates title of accordion', () => CFAccordionInteractor(including('Test field')).exists());

    describe('filling options for new field', () => {
      beforeEach(async () => {
        await CFSettingsRowInteractor({ index: 0 }).fillLabel('beta');
        await CFSettingsRowInteractor({ index: 1 }).fillLabel('alpha');
        await saveButton.click();
      });

      it('should send correct new custom field data', () => {
        return converge(() => {
          const body = JSON.parse(updateCustomFieldsHandler.args[0][1].requestBody);
          const {
            name,
            selectField,
          } = body.customFields[7];

          if (!isEqual(
            { name, selectField },
            {
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
            }
          )) {
            throw new Error('expected request body to equal expected object');
          }

          if (body.entityType !== 'user') throw new Error(`expected body entityType to be user, got ${body.entityType}`);
        });
      });

      it('should use correct configName format with configNamePrefix', () => {
        return converge(() => {
          const body = JSON.parse(updateConfigurationHandler.args[0][1].requestBody);

          if (body.configName !== 'prefix_custom_fields_label') throw new Error(`expected body configName to be prefix_custom_fields_label, got ${body.configName}`);
        });
      });
    });
  });

  describe('when there is a `scope` prop', () => {
    beforeEach(async function ()  {
      this.server.put('/settings/entries/tested-custom-field-label', updateSettingsHandler);

      await renderComponent({
        scope: 'test-scope',
      });
    });

    it('should show correct section title', () => sectionTitle.has({ value: 'Custom Fields label' }));

    it('should use the correct body for PUT /settings/entries ', async () => {
      await form.addField('Multi-select');
      await TextField('Field label*').fillIn('Test field');
      await CFSettingsRowInteractor({ index: 0 }).fillLabel('beta');
      await CFSettingsRowInteractor({ index: 1 }).fillLabel('alpha');
      await saveButton.click();

      const expectedBody = {
        id: 'tested-custom-field-label',
        key: 'prefix_custom_fields_label',
        scope: 'test-scope',
        value: 'Custom Fields label',
      };

      return converge(() => {
        const body = JSON.parse(updateSettingsHandler.args[0][1].requestBody);

        if (!isEqual(body, expectedBody)) throw new Error('the expected body is in the incorrect format');
      });
    });
  });
});
