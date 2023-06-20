# EntryManager
Component for handling CRUD workflow

## Description
Many objects are managed in a workflow that includes a listing page, a
detail page, and an add/edit page that also includes delete functionality.
This component facilitates that pattern. Given components representing the
object's detail and edit pages as well a few additional properties, the
EntryManager provides a fully-implemented browse/read/edit/add/delete workflow.

### Required Props
Name | type | description
--- | --- | ---
entryLabel | string | Label for the object type being managed, e.g. "User" or "Loan Rule"
formComponent | component | A component providing the add/edit form. The content of `render()` will be wrapped by `reduxForm()`.
detailComponent | component | A component providing the read-only/detail view of the object. The content of `render()` will be rendered inside a `Pane`.
permissions | object with keys `put`, `post`, `delete` | permission strings to check for. To see the `New [Object]` button, a user must have permissions that satisfy both `put` and `post`; to see the `Edit [Object]` button a user must have permissions that satisfy `put`; to see the `Delete [Object]` button, a user must have permissions that satisfy `delete`.
parentMutator | object with the key `entries`| The `mutator` object from a connected component; see [Using the connected component](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md#using-the-connected-component). *The EntryManager will only manage objects bound to the key `entries`.*
nameKey | string | a property of the managed object used to retrieve its title in dialog boxes, e.g. "Are you certain you want to delete the `${props.entryLabel}` `${entry[nameKey]}`?" would be rendered as, "Are you certain you want to delete the User Julius Caesar?"
entryList | array | list of objects to be managed
paneTitle | string | title string for object-listing pane

### Optional Props
Name | type | description
--- | --- | ---
idFromPathnameRe | string | regular expression pattern to extract the object-id from the URL. Defaults to `/([^/]+)$`, i.e. everything following the final forward slash. Note that the value will be passed to the regular expression parser as a string so it is **not** necessary to escape forward slashes.
entryFormComponent | component | A component used to replace the default implementation of the form wrapper
defaultEntry | object | An object used to represent initial values for new entry
addMenu | component | An optional component which can be used to override default add menu
parseInitialValues | function | An optional function which can be used to parse initialValues object
isEntryInUse | function | An optional function which allows or prohibit item deletion. It takes an item id and returns a boolean value. 
prohibitItemDelete | object with keys `close`, `label`, `message` | An optional object which provides a possibility to customize label, message and submit button of `prohibitDelete` modal with relevant object properties. 
enableDetailsActionMenu | bool | If present and true, replaces the **Edit** button at top right of full records with an action menu offering **Duplicate**, **Edit** and **Delete**.
resourcePath | string | An optional string specifying the path to a resource from which full records can be obtained. See below.
parseInitialValues | function | A function which accepts a record as loaded and returns a potentially modified version of that record suitable for display and editing. **Note.** the record must not be modified in place, but a modified copy of it returned.
onBeforeSave | function | The converse of `parseInitialValues`: a function which accepts a record that has been edited in the entry form, and returns a potentially modified version of that record suitable for writing back to the WSAPI. **Note.** the record must not be modified in place, but a modified copy of it returned.

## Summary records

The `<EntryList>` component was created on the assumption that the records it manages are returned in full when a list is requested: so, for example, the list of records returned from `/path/to/endpoint` are each the same shape as the individual ones obtained by ID at paths like `/path/to/endpoint/12335`. This pattern is generally followed by most web-service endpoints provided by most FOLIO modules.

Some modules, however, return a list of summary records (for example, just ID and title), so that it's necessary to fetch each full record separately by ID. When `<EntryList>` is used to manage records on such an endpoint, the path to that service should be passed in as the `resourcePath` prop. When this is done, the full record is fetched each time a user views or edits a record.

