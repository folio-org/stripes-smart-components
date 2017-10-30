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
