import React from 'react';
import {
  useParams,
} from 'react-router-dom';

import { tenantCustomMenuSectionConfig, useSettings } from '@folio/stripes-core';
import {
  Loading,
  Pane,
} from '@folio/stripes-components';
import useCurrentModule from '@folio/stripes-core/src/components/ModuleHierarchy/useModuleHierarchy';

const menus = [
  { module: "@folio/users", id: "details" },
  { module: "@folio/users", id: "search" },
  { module: "@folio/inventory", id: "instance-details" },
  { module: "@folio/inventory", id: "search" },
];

const data = [
  { module: '@folio/users', id: 'search', text: 'hola', link: 'https://duckduckgo.com/' },
  { module: '@folio/users', id: 'details', text: 'static link', link: 'https://duckduckgo.com/?q=whist&atb=v526-1&ia=web' },
  { module: '@folio/users', id: 'details', text: 'dynamic link', link: 'https://duckduckgo.com/?q={{user.barcode}}' },
  { module: '@folio/users', id: 'details', text: 'dynamic {{user.personal.firstName}} {{user.personal.lastName}}', link: 'https://duckduckgo.com/?q={{user.id}}' },

  { module: '@folio/inventory', id: 'search', text: 'hola', link: 'https://duckduckgo.com/' },
  { module: '@folio/inventory', id: 'instance-details', text: 'static link', link: 'https://duckduckgo.com/?q=whist&atb=v526-1&ia=web' },
  { module: '@folio/inventory', id: 'instance-details', text: 'dynamic link', link: 'https://duckduckgo.com/?q={{instance.id}}' },
  { module: '@folio/inventory', id: 'instance-details', text: 'dynamic {{instance.title}}', link: 'https://duckduckgo.com/?q={{instance.title}}' },

];

export const useCustomMenus = () => {
  const [currentModule] = useCurrentModule();

  const availableMenus = () => {
    return menus.filter((i) => i.module === currentModule);
  };

  return {
    availableMenus,
  }
};

const CustomMenuSettings = () => {
  const [currentModule] = useCurrentModule();
  console.log({ currentModule })

  const { id } = useParams();

  const onSave = () => { };

  console.log({ id })


  // return {
  //   settings: data || DEFAULT_SETTINGS,
  //   isLoading,
  //   updateSetting: mutateAsync,
  //   removeSetting: deleteSetting,
  // };
  const { isLoading, settings } = useSettings(tenantCustomMenuSectionConfig.SCOPE, tenantCustomMenuSectionConfig.KEY);

  if (!isLoading) {
    console.log({ settings })
    return <h4>hola</h4>
  }

  return <Loading />;
};

export default CustomMenuSettings;

