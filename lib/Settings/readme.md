# Settings

Displays the settings page for a Stripes module, given a list of the sub-pages to link and route to.

## Usage

```
import React from 'react';
import Settings from './Settings';

import PermissionSets from './PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';

const pages = [
  { route: 'perms', label: 'Permission sets', component: PermissionSets, perm: 'perms.permissions.get' },
  { route: 'groups', label: 'Patron groups', component: PatronGroupsSettings },
];

export default props => <Settings {...props} pages={pages} />;
```

## Properties

The following properties are supported:

* `navPaneWidth`: a string indicating the width of the pane where the nav links are, e.g., `"30%"`
* `paneTitle`: the human-readable label of the pane where the nav links are.
* `paneTitleRef`: the function to set a ref to the pane title element
* `pages`: the list of sub-pages to be linked from the settings page. Each member of the list is an object with the following members:
  * `route`: the route, relative to that of the settings page, on which the sub-page should be found.
  * `label`: the human-readable label that, when clicked on, links to the specified route.
  * `component`: the component that is rendered at the specified route.
  * `perm`: if specified, the name of a permission which the current user must have in order to access the page; if the user lacks the permission, then the link is not provided. (If omitted, then no permission check is performed for the sub-page.)
  * `iface`: if specified, the name of an interface which the system must implement in order to access the page; if the interface is not present, then the link is not provided. (If omitted, then no interface check is performed for the sub-page.)
* `sections`: an array of section objects. Each member of the list is an object with the following members:
  * `label`: the human-readable label that, when clicked on, links to the specified route.
  * `pages`: which has the same form as the `pages` prop
* `additionalRoutes`: an optional array of `<Route>` objects that are included in the `<Settings>` component's routing for its sub-pane, but which are not displayed in the visible list of settings sections.

  This is useful for routing paths below the top level of a settings
  page. For example, if you want your Foo module's Bar settings page to
  be able to see a specific Bar in detail, you might pass `pages`
  including:
```
    {
      route: 'bar',
      id: 'Maintain all Bars',
      component: ListOfBar,
    },
```
  and also `additionalRoutes` including:
```
    <Route
      path={`${match.path}/bar/:id`}
      render={p => <SingleBar {...p} label="Maintain specific Bar" />}
    />
```
