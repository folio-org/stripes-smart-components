/* eslint-disable */

import { beforeEach } from '@bigtest/mocha';
import setupStripesCore from '@folio/stripes-core/test/bigtest/helpers/setup-application';
import { withModules, clearModules } from '@folio/stripes-core/test/bigtest/helpers/stripes-config';
import mirageOptions from './network';

export function setupApplication({
  scenarios,
  component = null,
  permissions = {},
} = {}) {
  setupStripesCore({
    mirageOptions: {
      serverType: 'miragejs',
      ...mirageOptions
    },
    scenarios,
    permissions,

    // setup a dummy app for smart components
    modules: [{
      type: 'app',
      name: '@folio/ui-dummy',
      displayName: 'dummy.title',
      route: '/dummy',
      module: () => component,
    }],

    translations: {
      'dummy.title': 'Dummy'
    }
  });

  // go to the dummy app where smart components are mounted
  beforeEach(function () { // eslint-disable-line func-names
    this.visit('/dummy');
  });
}

// replace the dummy app to mount the component
export function mount(component) {
  clearModules();

  withModules([{
    type: 'app',
    name: '@folio/ui-dummy',
    displayName: 'dummy.title',
    route: '/dummy',
    module: () => component
  }]);
}

export const parseMessageFromJsx = (values, translation) => {
  const parsedMessage = new DOMParser().parseFromString(translation, 'text/html').body.textContent || '';

  return Object.keys(values).reduce((res, key) => {
    return res.includes(key) ? res.replace(`{${key}}`, values[key]) : res;
  }, parsedMessage);
};

export const wait = (ms = 1000) => new Promise(resolve => { setTimeout(resolve, ms); });

const warn = console.warn;
const warnBlocklist = [
  /componentWillReceiveProps has been renamed/,
  /componentWillUpdate has been renamed/,
  /componentWillMount has been renamed/,
  /Formatter possibly needed for column/,
];

const error = console.error;
const errorBlocklist = [
  /React Intl/,
  /Cannot update a component from inside the function body of a different component/,
  /Can't perform a React state update on an unmounted component./,
  /Invalid prop `component` supplied to.*Field/,
  /Each child in a list/,
  /Failed prop type/,
  /component is changing an uncontrolled/,
  /validateDOMNesting/,
  /Invalid ARIA attribute/,
  /Unknown event handler property/,
  /React does not recognize the/,
];

export function turnOffWarnings() {
  console.warn = function (...args) {
    if (warnBlocklist.some(rx => rx.test(args[0]))) {
      return;
    }
    warn.apply(console, args);
  };

  console.error = function (...args) {
    if (errorBlocklist.some(rx => rx.test(args[0]))) {
      return;
    }
    error.apply(console, args);
  };
}
