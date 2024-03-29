import { expect } from 'chai';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';

import ControlledVocabInteractor from './interactor';
import {
  setupApplication,
  parseMessageFromJsx,
} from '../../../tests/helpers';
import translations from '../../../translations/stripes-smart-components/en';
import mountComponent from './mountComponent';

describe('ControlledVocabErrors', () => {
  const cv = new ControlledVocabInteractor();

  function mount() {
    // eslint-disable-next-line no-undef
    beforeEach(function () {
      mountComponent(true, this.server);
      this.server.post('location-units/institutions', {
        'errors': [{
          'message': 'Cannot create entity; name is not unique',
          'code': 'name.duplicate',
          'parameters': [{
            'key': 'fieldLabel',
            'value': 'name'
          }]
        },
        {
          'message': 'test',
          'code': '-1',
          'parameters': [{
            'key': 'test',
            'value': 'test'
          }]
        }]
      }, 422);
    });
    beforeEach(async () => {
      await cv.newButton().click();
      await cv.fillInputField('test');
      await cv.saveButton();
    });
  }

  describe('multiple errors', () => {
    setupApplication();
    mount();

    it('should display field error message', () => {
      expect(cv.emptyFieldError).to.equal(parseMessageFromJsx(
        { fieldLabel: 'name' },
        translations['error.name.duplicate']
      ));
    });

    it('should display common error message', () => {
      expect(cv.commonErrors).to.equal(
        translations['error.defaultSaveError']
      );
    });
  });

  describe('custom error', () => {
    setupApplication({ scenarios: ['controlled-vocab-custom-error'] });
    mount();

    it('should display default error message', () => {
      expect(cv.commonErrors).to.equal(
        translations['error.defaultSaveError']
      );
    });
  });

  describe('default error', () => {
    setupApplication({ scenarios: ['controlled-vocab-default-error'] });
    mount();

    it('should display default error message', () => {
      expect(cv.commonErrors).to.equal(
        translations['error.defaultSaveError']
      );
    });
  });
});
