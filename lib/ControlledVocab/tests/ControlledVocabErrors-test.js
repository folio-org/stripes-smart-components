import {
  describe,
  beforeEach,
  it,
} from 'mocha';

import {
  TextField,
  Button,
  including,
  HTML
} from '@folio/stripes-testing';

import {
  setupApplication,
} from '../../../tests/helpers';
import translations from '../../../translations/stripes-smart-components/en';
import mountComponent from './mountComponent';

const CommonError = HTML.extend('ControlledVocab Error')
  .selector('[data-test-common-errors]');

describe('ControlledVocabErrors', () => {
  function mount(props) {
    // eslint-disable-next-line no-undef
    beforeEach(function () {
      mountComponent(true, this.server, props);
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
      await Button(/New/).click();
      await TextField('name 0').fillIn('test');
      await Button('Save').click();
    });
  }

  describe('multiple errors', () => {
    setupApplication();
    mount();

    it('should display field error message', () => TextField({ label: 'name 0' }).has({ error: including('already exists') }));

    it('should display common error message', () => CommonError(translations['error.defaultSaveError']));
  });

  describe('custom error', () => {
    setupApplication({ scenarios: ['controlled-vocab-custom-error'] });
    mount();

    it('should display default error message', () => CommonError(translations['error.defaultSaveError']));
  });

  describe('default error', () => {
    setupApplication({ scenarios: ['controlled-vocab-default-error'] });
    mount();

    it('should display default error message', () => CommonError(translations['error.defaultSaveError']));
  });
});
