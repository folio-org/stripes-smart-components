# SearchAndSort

Generic component providing the heart of search-and-sort modules

## Description

Many Stripes application modules are primarily to do with searching, sorting and browsing sets of records of some kind, and viewing their detailed information, editing them, creating new records, etc. Examples of such modules include ui-users, ui-inventory and ui-requests. Such modules can be created quickly and easily by having their `render` method simply invoke `<SearchAndSort>` with appropriate configuration. It is then the application's responsibility to provide components that view records of the relevant type in detail, that edit them, etc.

### Properties

Name | type | description
--- | --- | ---
moduleName | string | The machine-readable name of the module for which `<SearchAndSort>` is being invoked, to be used in generating HTML IDs, etc. This is usually the last component of `packageInfo.name`.
moduleTitle | string | The human-readable name of the module, to be used in visible titles, etc. This is usually `packageInfo.stripes.displayName`.
objectName | string | The machine-readable name of the kind of record that is being managed -- often the singular form of the `moduleName` (e.g. "user" for "users"). This is used both in HTML IDs and, in capitalised form, in some human-readable captions.
baseRoute | string | The base route at which the module is visible. Should be set to `packageInfo.stripes.route`.
searchableIndexes | array of structures | Each structure in the array represents an index which the application can search in. The presence of this property causes a dropdown to appear before the query box offering the choice of indexes. Each structure must contain a human-readable string called `label`, a corresponding CQL index-name called `value` (which may be blank for a "search all indexes" entry) and optionally a boolean called `disabled`, which should be set for indexes which should be displayed greyed out and unavailable for selection.
searchableIndexesPlaceholder | string | If this is provided and is a string, then it appears as an unselectable (permanently disabled) first entry in the index-selection dropdown. If it is provided and is `null` then no placeholder is added. For backwards compatibility, if it completely absent then a default placeholder string is used.
selectedIndex | string | When `searchableIndexes` is provided, this must also be supplied, its value matching one of those in the provided array.
onChangeIndex | function | If provided, this function is invoked, and passed an event structure, when the user changes which index is selected.
maxSortKeys | number | If provided, specifies that maximum number of sort-keys that should be remembers for "stable sorting". Defaults to 2 if not specified.
filterConfig | array of structures | Configuration for the module's filters, as documented [in the `<FilterGroups>` readme](https://github.com/folio-org/stripes-components/tree/master/lib/FilterGroups#filter-configuration).
initialFilters | string | The initial state of the filters when the application started up, used when resetting to the initial state. Takes the same form as the `filters` part of the URL: a comma-separated list of `group`.`name` filters that are selected.
disableFilters | object whose keys are filter-group names | In the display of filter groups, those that are named in this object are greyed out and cannot be selected.
filterChangeCallback | function | If provided, this function is invoked when the user changes a filter. It is passed the new set of filters, in the form of an object whose keys are the `group`.`name` specifiers of each selected filter.
initialResultCount | number | The number of records to fetch when a new search is executed (including the null search that is run when the module starts).
resultCountIncrement | number | The amount by which to increase the number of records when scrolling close to the bottom of the loaded list.
viewRecordComponent | component | A React component that displays a record of the appropriate type in full view. This is invoked with a specific set of properties that ought also to be documented, but for now, see the example of [`<ViewUser>` in ui-users](https://github.com/folio-org/ui-users/blob/master/ViewUser.js).
editRecordComponent | component | A React component that displays an editing form for a record of the appropriate type, and which can also be used for creating new records. This is invoked with a specific set of properties that ought also to be documented, but for now, see the example of [`<UserForm>` in ui-users](https://github.com/folio-org/ui-users/blob/master/UserForm.js).
newRecordInitialValues | object whose keys are field-names | Values to set into the form when creating a new record.
visibleColumns | array of fieldnames | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
columnWidths | object whose names are field captions | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
columnMapping | object whose names are field captions | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
resultsFormatter | object mapping field-names to functions | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
onSelectRow | func | Optional function to override the default action when selecting a row (which displays the full record). May be used, for example, when running one module embedded in another, as when ui-checkin embeds an instance of ui-users to select the user for whom items are being checked out.
massageNewRecord | func | If provided, this function is passed newly submitted records and may massage them in whatever way it wishes before they are persisted to the back-end. May be used to perform lookups, expand abbreviations, etc.
onCreate | func | A function which is passed the (possibly massaged) record, and must persist it to the back-end. In most cases this will be a one-liner, but some modules (e.g. ui-users) have more complex requirements.
finishedResourceName | string | Newly created records are displayed as soon as they are created. Usually that is as soon as the record itself exists, but in some cases it is not until some other operation has completed -- for example, new user records are not ready to be displayed until their permissions have been added. In such situations, this property may be set to the name of the resource which must have completed its operations before the record is ready.
viewRecordPerms | string | A comma-separated list of the permissions required in order to view a full record.
newRecordPerms | string | A comma-separated list of the permissions required in order to create a new record.
disableRecordCreation | bool | If true, new record cannot be created. This is appropriate when one application is running embedded in another.
parentResources | shape | The parent component's stripes-connect `resources` property, used to access the records of the relevant type. Must contain at least `records`, `query` (the anointed resource used for navigation) and `resultCount` (a scalar used in infinite scrolling).
parentMutator | shape | The parent component's stripes-connect `mutator` property. Must contain at least `query` (the anointed resource used for navigation) and `resultCount` (a scalar used in infinite scrolling).

See ui-users' top-level component [`<Users.js>`](https://github.com/folio-org/ui-users/blob/master/Users.js) for an example of how to use `<SearchAndSort>`.

