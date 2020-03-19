Currently, custom fields feature provides two components (pages) which can be utilized to edit and view custom fields configuration for a module.

## ViewCustomFieldsSettings
`ViewCustomFieldsSettings`'s responsibilities are basically fetching custom fields configuration data for the provided entity type and displaying them inside accordions.

### Usage example
```js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ViewCustomFieldsSettings } from '@folio/stripes/smart-components';

class CustomFieldsSettings extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  redirectToEdit = () => {
    this.props.history.push('/users/custom-fields/edit');
  }

  render() {
    return (
      <ViewCustomFieldsSettings
        backendModuleName="users"
        entityType="user"
        redirectToEdit={this.redirectToEdit}
      />
    );
  }
}

export default CustomFieldsSettings;
```

### Props
Name | type | description | required
--- | --- | --- | ---
`backendModuleName` | string | used to set correct `x-okapi-module-id` header when making requests to `mod-custom-fields`| true
`entityType` | string | used to filter custom files by particular entity type |true
`redirectToEdit` | func | function that redirect to route which renders `<EditCustomFieldsSettings />` |true

## EditCustomFieldsSettings
`EditCustomFieldsSettings` provides the functionality to create, edit and delete custom fields for the provided entity type.

### Usage example
```js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { EditCustomFieldsSettings } from '@folio/stripes/smart-components';

class EditCustomFields extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  redirectToView = () => {
    this.props.history.push('/settings/users/custom-fields');
  }

  render() {
    return (
      <EditCustomFieldsSettings
        backendModuleName="users"
        entityType="user"
        redirectToView={this.redirectToView}
      />
    );
  }
}

export default EditCustomFields;
```

### Props
Name | type | description | required
--- | --- | --- | ---
`backendModuleName` | string | used to set correct `x-okapi-module-id` header when making requests to `mod-custom-fields`| true
`entityType` | string | used to filter custom files by particular entity type |true
`redirectToView` | func | function that redirect to route which renders `<ViewCustomFieldsSettings />` |true


## ViewCustomFieldsRecord
`ViewCustomFieldsRecord`'s responsibilities are basically fetching custom fields configuration data for displaying accordions with them.

### Usage example
```js
import { ViewCustomFieldsRecord } from '@folio/stripes/smart-components';

---

<ViewCustomFieldsRecord
  accordionId="customFields"
  backendModuleName="users"
  customFieldsValues={{
    'textbox-short-1': 'value1',
    'textbox-long-2': 'value2',
  }}
  entityType="user"
  expanded={this.state.sections.customFields}
  onToggle={this.handleSectionToggle}
/>
```

### Props
Name | type | description | required | default
--- | --- | --- | --- | ---
`accordionId` | string | used to set accordion id | true |
`backendModuleName` | string | used to set correct `x-okapi-module-id` header when making requests to `mod-custom-fields`| true |
`columnCount` | number | grid display in the same menner as other accordions in current page | false | 4
`customFieldsValues` | object | values for the custom fields | true |
`entityType` | string | used to filter custom files by particular entity type | true |
`expanded` | boolean | accordion open or closed | true |
`onToggle` | func | callback for toggling the accordion open/closed | true |



## EditCustomFieldsRecord
`EditCustomFieldsSettings` provides the functionality to create, edit and delete custom fields values for the choosing record.

### Usage example
```js
import { Field } from 'redux-form';
import { EditCustomFieldsRecord } from '@folio/stripes/smart-components';

---

<EditCustomFieldsRecord
  accordionId="customFields"
  backendModuleName="users"
  entityType="user"
  expanded={this.state.sections.customFields}
  fieldComponent={Field}
  onToggle={this.handleSectionToggle}
/>
```

### Props
Name | type | description | required | default
--- | --- | --- | --- | ---
`accordionId` | string | used to set accordion id | true |
`backendModuleName` | string | used to set correct `x-okapi-module-id` header when making requests to `mod-custom-fields`| true
`columnCount` | number | grid display in the same menner as other accordions in current page | false | 4
`entityType` | string | used to filter custom files by particular entity type |true
`expanded` | boolean | accordion open or closed | true |
`fieldComponent` | node | Field component | true |
`onToggle` | func | callback for toggling the accordion open/closed | true |
