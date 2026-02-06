import React from 'react';
import setupStripesCore from '@folio/stripes-core/test/bigtest/helpers/setup-application';
import {
  describe,
  beforeEach,
  it,
} from 'mocha';



import { HTML } from '@folio/stripes-testing';
import { Paneset } from '@folio/stripes-components';
import mirageOptions from '../../../tests/network';
import Settings from '../Settings';

const settingsInteractor = HTML.extend('Settings')
  .selector('#app-settings-nav-pane')
  .filters({
    numLinks: (el) => el.querySelector('[data-test-nav-list]').querySelectorAll('a').length,
    numActiveLinks: (el) => [...el.querySelectorAll('[data-test-nav-list-item]')].filter(
      (item) => item.className.includes('isActive'),
    ).length,
    navTitle: (el) => el.querySelector('[data-test-pane-header]').innerText,
  });

const MockSettingsPage = () => <div>Mock Settings</div>;

const TestApp = (props) => {
  const pages = [
    { route: 'perms', label: 'Permission sets', component: MockSettingsPage, perm: 'perms.permissions.get' },
    { route: 'groups', label: 'Patron groups', component: MockSettingsPage },
    { route: 'custom-fields-po', label: 'PO Custom Fields', component: MockSettingsPage },
    { route: 'custom-fields-pol', label: 'POL Custom Fields', component: MockSettingsPage },
  ];
  return ((
    <Paneset>
      <Settings pages={pages} paneTitle="Test title" {...props} />
    </Paneset>
  ));
};

function setupApplication({
  scenarios,
  component = null,
  permissions = {},
  stripesConfig
} = {}) {
  const initialState = {
    discovery: {
      modules: {
        'users-module-id': 'users-test',
      },
    }
  };
  setupStripesCore({
    mirageOptions: {
      serverType: 'miragejs',
      ...mirageOptions
    },
    stripesConfig,
    scenarios,
    permissions,
    initialState,
    // setup a dummy app for smart components
    modules: [{
      type: 'app',
      name: '@folio/ui-dummy',
      displayName: 'dummy.title',
      route: '/dummy',
      module: (props) => component(props),
    }],

    translations: {
      'dummy.title': 'Dummy'
    }
  });

  // go to the dummy app where smart components are mounted
  beforeEach(async function () { // eslint-disable-line func-names
    await this.visit('/dummy');
  });
}

describe('Settings', () => {
  const settings = settingsInteractor();
  setupApplication({ component: TestApp });
  beforeEach(async function () { // eslint-disable-line func-names
    await this.visit('/dummy');
  });

  it('renders the pane title', () => settings.has({ navTitle: 'Test title' }));
  it('renders correct number of links', () => settings.has({ numLinks: 4 }));

  describe('active link with prefix-overlapping routes', () => {
    describe('when navigating to the longer route', () => {
      beforeEach(async function () {
        await this.visit('/dummy/custom-fields-pol');
      });

      it('marks only the selected route as active', () => settings.has({ numActiveLinks: 1 }));
    });

    describe('when navigating to the shorter route', () => {
      beforeEach(async function () {
        await this.visit('/dummy/custom-fields-po');
      });

      it('marks only the selected route as active', () => settings.has({ numActiveLinks: 1 }));
    });

    describe('when navigating to a sub-route of the shorter route', () => {
      beforeEach(async function () {
        await this.visit('/dummy/custom-fields-po/detail');
      });

      it('keeps the parent route active', () => settings.has({ numActiveLinks: 1 }));
    });
  });
});
