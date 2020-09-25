import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  mount,
  setupApplication,
  axe,
} from '../../../../../../../tests/helpers';

import AddButton from '../AddButton';
import AddButtonInteractor from './interactor';

describe('AddButton', () => {
  setupApplication();

  const addButton = new AddButtonInteractor();
  const handleAdd = sinon.spy();
  const options = [
    {
      label: 'Textbox',
      value: 'TEXTBOX_SHORT',
    },
    {
      label: 'Text area',
      value: 'TEXTBOX_LONG',
    },
  ];

  const renderComponent = (props) => {
    return mount(
      <AddButton
        handleAdd={handleAdd}
        options={options}
        {...props}
      />
    );
  };

  let a11yResults = null;

  beforeEach(async () => {
    await renderComponent();
    await addButton.whenLoaded();
    a11yResults = await axe.run();

    handleAdd.resetHistory();
  });

  it('should not have any a11y issues', () => {
    expect(a11yResults.violations).to.be.empty;
  });

  it('should render dropdown', () => {
    expect(addButton.hasDropdown).to.be.true;
  });

  it('should render all custom field types', () => {
    expect(addButton.addCustomFieldButtons().length).to.equal(options.length);
  });

  it('should render all custom field types with correct labels', () => {
    options.forEach((option, index) => {
      expect(addButton.addCustomFieldButtons(index).label).to.equal(option.label);
    });
  });

  describe('when clicking on an option', () => {
    beforeEach(async () => {
      await addButton.addCustomFieldButtons(0).click();
    });

    it('should call "handleAdd" with correct value', () => {
      expect(handleAdd.firstCall.args[0]).to.equal(options[0].value);
    });
  });
});
