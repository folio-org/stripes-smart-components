# ControlledVocab

## Description

Expanded [`<EditableList>`](https://github.com/folio-org/stripes-smart-components/blob/master/lib/EditableList/readme.md) with more functionality, such as sorting, filtering, and suppression.

## Props

Name | Type | Default | Description
--- | --- | --- | ---
actionProps | Object | `{ delete: (item) => {return { disabled: item.item.inUse } } }` | Object containing properties of list action names: 'delete', 'edit' and values of sentinel functions that return objects to destructure onto the action button props
actionSupressor | Object | `{edit: item: => item.readOnly, delete: item, => item.readOnly}` | Object containing properties of list action names: `delete`, `edit` and values of sentinel functions that return booleans based on object properties
actuatorType | String | `'rest'` | Either `rest` or `refdata`. If manually set to `refdata`, sets actuators to PUT only
baseUrl | String | | A string to customize the path which should be used. Required
canCreate | Boolean | `true` | As for [`<EditableList>`](https://github.com/folio-org/stripes-smart-components/edit/master/lib/EditableList/readme.md)
columnMapping | Object | `{name : ..., lastUpdated: ..., numberOfObjects: ...}` | As for [`<EditableList>`](https://github.com/folio-org/stripes-smart-components/edit/master/lib/EditableList/readme.md)
editable | Boolean | `true` | Allows custom content/components to be displayed in the grid
formatter | Object | | As for [`<EditableList>`](https://github.com/folio-org/stripes-smart-components/edit/master/lib/EditableList/readme.md)
hiddenFields | Array of Strings | | A list of the fields present in the table not wanted in the UI
hideCreateButton | Boolean | `false` | Hides create button
id | String | `controlled-vocab-` | Used as a basic suffix for id attributes throughout the component.
itemTemplate | Object | | Object where each key's value is the default value for that field: `{ resourceType: 'book' }`
label | ReactNode | | The text for the H3 tag in the header of the component. Required
limitParam | String | | Limit parameter for the GET url
listFormLabel | ReactNode | | If provided, it will be used instead of what is provided in the `label` prop
listSupressor | Function | | Allows for the supression of the resulting list
listSupressorText | ReactNode | | If list is suppressed, this message will show instead
nameKey | String | `undefined` | The key that uniquely names listed objects: defaults to 'name'
objectLabel | ReactNode | | Labels the objects present in the `numberOfObjects` column
parseRow | Function | | Allows to parse the tables rows according to user implemented function.
readOnlyFields | Array of Strings | | Array of non-editable columns - good for displaying meta information within the row.
rowFilter | Element | | An optional React element placed above the list to present the filter parameters
rowFilterFunction | Function | | Allows for specific filtering of resulting rows
sortBy | String | `name` | Field of which to sort table
translations | Object | | Object of strings used to display different messages to the user
validate | Function | | Allows for custom field validation. The function is called for each record (row) and should return an empty object for no errors, or an object where the keys are the field names and the values are the error message components/strings to display

For a usage example see [`<PatronGroupSettings>`](https://github.com/folio-org/ui-users/blob/master/src/settings/PatronGroupsSettings.js)