# SearchAndSort

Generic component providing the heart of search-and-sort modules

<!-- md2toc -l 2 readme.md -->
* [Description](#description)
    * [Properties](#properties)
* [`makeQueryFunction`](#makequeryfunction)

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
onDismissDetail | function | A function to call when the detail record pane is dismissed.
maxSortKeys | number | If provided, specifies that maximum number of sort-keys that should be remembered for "stable sorting". Defaults to 2 if not specified.
sortableColumns | array | If provided, specifies the columns that can be sorted.
filterConfig | array of structures | Configuration for the module's filters, as documented [in the `<FilterGroups>` readme](https://github.com/folio-org/stripes-components/tree/master/lib/FilterGroups#filter-configuration).
hasRowClickHandlers | bool | Defaults to true. Turns row-level click handlers on and off for the results.
indexRef | ref | Reference to search index dropdown element.
initialFilters | string | The initial state of the filters when the application started up, used when resetting to the initial state. Takes the same form as the `filters` part of the URL: a comma-separated list of `group`.`name` filters that are selected.
disableFilters | object whose keys are filter-group names | In the display of filter groups, those that are named in this object are greyed out and cannot be selected.
inputRef | ref | Reference to search query input element.
inputType | string | Type of search box. Can  be `input` or `textarea`.
filterChangeCallback | function | If provided, this function is invoked when the user changes a filter. It is passed the new set of filters, in the form of an object whose keys are the `group`.`name` specifiers of each selected filter.
onFilterChange | function | Callback to be called after filter value is changed. Gets filter name and filter values in a form of an object `{ name: <String>, values: <Array> }`.
renderFilters | function | Renders a set of filters. Gets onChange callback to be called after filter value change.
renderNavigation | function | Renders a component at the top of the first section (filters) to be used as navigation. Default `noop`.
initialResultCount | number | The number of records to fetch when a new search is executed (including the null search that is run when the module starts).
resultCountIncrement | number | The amount by which to increase the number of records when scrolling close to the bottom of the loaded list.
resultCountMessageKey | string | Override the default translation key for the result count message (defaults to something like `17 records found`)
viewRecordComponent | component | A React component that displays a record of the appropriate type in full view. This is invoked with a specific set of properties that ought also to be documented, but for now, see the example of [`<ViewUser>` in ui-users](https://github.com/folio-org/ui-users/blob/master/ViewUser.js).
viewRecordPathById | function | A function that takes an id and returns a path to link brief records to. Used in lieu of `viewRecordComponent`
createRecordPath | string | Path to link the "New" button to rather than use `editRecordComponent`.
editRecordComponent | component | A React component that displays an editing form for a record of the appropriate type, and which can also be used for creating new records. This is invoked with a specific set of properties that ought also to be documented, but for now, see the example of [`<UserForm>` in ui-users](https://github.com/folio-org/ui-users/blob/master/UserForm.js).
newRecordInitialValues | object whose keys are field-names | Values to set into the form when creating a new record.
visibleColumns | array of fieldnames | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
columnManagerProps | Applies additional props for the internal `<ColumnManager>` | As for [`<ColumnManager>`](https://github.com/folio-org/stripes-smart-components/blob/master/lib/ColumnManager/readme.md)
columnWidths | object whose names are field captions | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
columnMapping | object whose names are field captions | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
resultRowFormatter | object mapping field-names to functions | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
resultsFormatter | object mapping field-names to functions | As for [`<MultiColumnList>`](https://github.com/folio-org/stripes-components/blob/master/lib/MultiColumnList/readme.md)
resultRowIsSelected | func | function returning a boolean to determine whether or not an item in the results should have the 'selected' CSS style applied. A default `isMatch` function is supplied.
onSelectRow | func | Optional function to override the default action when selecting a row (which displays the full record). May be used, for example, when running one module embedded in another, as when ui-checkin embeds an instance of ui-users to select the user for whom items are being checked out.
massageNewRecord | func | If provided, this function is passed newly submitted records and may massage them in whatever way it wishes before they are persisted to the back-end. May be used to perform lookups, expand abbreviations, etc.
onCreate | func | A function which is passed the (possibly massaged) record, and must persist it to the back-end. In most cases this will be a one-liner, but some modules (e.g. ui-users) have more complex requirements.
finishedResourceName | string | Newly created records are displayed as soon as they are created. Usually that is as soon as the record itself exists, but in some cases it is not until some other operation has completed -- for example, new user records are not ready to be displayed until their permissions have been added. In such situations, this property may be set to the name of the resource which must have completed its operations before the record is ready.
viewRecordPerms | string | A comma-separated list of the permissions required in order to view a full record.
newRecordPerms | string | A comma-separated list of the permissions required in order to create a new record.
disableRecordCreation | bool | If true, new record cannot be created. This is appropriate when one application is running embedded in another.
parentResources | shape | The parent component's stripes-connect `resources` property, used to access the records of the relevant type. Must contain at least `records`, `query` (the anointed resource used for navigation) and `resultCount` (a scalar used in infinite scrolling).
syncQueryWithUrl | bool | Will enable or disable syncing of `query` parameter in the url with search query input value.
parentMutator | shape | The parent component's stripes-connect `mutator` property. Must contain at least `query` (the anointed resource used for navigation) and `resultCount` (a scalar used in infinite scrolling).
nsParams | object or string | An object or string used to namespace search and sort parameters. More information can be found [here](https://github.com/folio-org/stripes-components/blob/master/util/parameterizing-makeQueryFunction.md)
notLoadedMessage | node | A message to show the user before a search has been submitted. Defaults to "Choose a filter or enter search query to show results".
getHelperResourcePath | func | An optional function which can be used to return helper's resource path dynamically.
getHelperComponent | func | An optional function which can be used to return connected helper component implementation.
title | string/element | An optional property to specify title of results pane. By default module display name is used.
hasNewButton | boolean | An optional property to specify appearance Of `New` button of results pane. By default pane displays with `New` button.
basePath | string | An optional string to customize the path which should be used after performing search.
resultsStickyFirstColumn | boolean | Sets the first result column as sticky, so it will stay visible during horizontal scroll.
resultsStickyLastColumn | boolean | Sets the last result column as sticky, so it will stay visible during horizontal scroll.
resultsVirtualize | boolean | controls the `virtualize` prop to the internally rendered `<MultiColumnList>` component.
resultsOnMarkPosition | func | sets the `onMarkPosition` prop to the internally rendered `<MultiColumnList>` component. A paramater "position" object with a list offset and selector is provided. This can be stored on the application side to resume scroll position of the results list (if using next/prev pagination.)
resultsOnResetMarkedPosition | func | sets the `onMarkReset` prop to the internally rendered `<MultiColumnList>` component. It can be used to nullify the "position" object in application state.
resultsCachedPosition | position object |  sets the `ItemToView` prop of the internally rendered `<MultiColumnList>` component. It's in the shape of `{selector: string, clientTopOffset: number}`. This object is provided by the `resultsOnMarkPosition` prop.
resultsKey | string | Sets a `key` prop on the internally rendered `<MultiColumnList>`. Changing this value will re-initialize the MCL. If necessary, this can be used to refresh the component so that it resets/readjusts to updates in data. This should be used sparingly as it can cause multiple re-renders of the list.
customPaneSubText | node | A component that will be rendered in PaneSubHeader instead of default.
customPaneSub | node | A component that will be rendered in the PaneSubHeader (after `customPaneSubText`).
searchFieldButtonLabel | node | A component that will be rendered inside the SearchField button instead of default.
isCountHidden | bool | A prop that give us possibiblty to hide count of records in Pane.
onSubmitSearch | function | An optional function to extend the form submission functionality.
extraParamsToReset | object | An object with parameters to be removed from the URL after the search query is submitted and after the user's search query is cleared.
advancedSearchOptions | array | Array of options for Advanced Search component. If empty then Advanced Search will not get rendered.
advancedSearchIndex | string | Value of advanced search index option. Tells `<SearchAndSort>` which index to set after searching by Advanced Search.
advancedSearchQueryBuilder | function | Custom query builder for Advanced Search.
actionMenu | function | Customizes the pane's action menu; see [PaneHeader](https://github.com/folio-org/stripes-components/tree/master/lib/PaneHeader)_for more information. This function also recieves the provided `columnManagerProps`
autofocusSearchField | boolean | If the `<SearchField>` should be auto-focused on mount
browseOnly | boolean | If true, the component will not show or navigate to record information on selection
pagingType | string | Type of paging to use on the `<MultiColumnList>`
pageAmount | boolean | Number of items to show per page in the `<MultiColumnList>`
pagingCanGoNext | boolean | If the "Next" button should be clickable on the `<MultiColumnList>`
pagingCanGoPrevious | boolean | If the "Previous" button should be clickable on the `<MultiColumnList>`
paneTitleRef | ref | Grab a ref to the pane's title element
detailProps | object | Additional props passed to the `viewRecordComponent` and `editRecordComponent`
getCellClass | func | Customize cell classes for the underlying `<MultiColumnList>`.  See the [MultiColumnList docs for more information](https://github.com/folio-org/stripes-components/tree/master/lib/MultiColumnList)
hidePageIndices | boolean | If the page indexes should be hidden on the underlying `<MultiColumnList>`
initiallySelectedRecord | string | The ID of an item to select upon initial mount
nonInteractiveHeaders | string[] | Columns in the `<MultiColumnList>` which should not be clickable
onCloseNewRecord | func | Callback for when the new record layer is closed
onComponentWillUnmount | func | Exposes React `componentWillUnmount`. Called with all of this component's props
onResetAll | func | Callback for when all filters/search is reset/cleared
resultsOnNeedMore | func | Custom data-fetching function, triggered when getting near the end of the fetched data. Void return, accepts an object with `records`, `source`, `direction`, `index`, `firstIndex`, and `askAmount`
showSingleResult | boolean | Whether to auto-show the details record when a search returns a single row
validateSearchOnSubmit | func | Validates the search query (passed as a parameter) before submission. Submission will be prevented if this returns false.

See ui-users' top-level component [`<Users.js>`](https://github.com/folio-org/ui-users/blob/master/Users.js) for an example of how to use `<SearchAndSort>`.

## `makeQueryFunction`

Invoked as:

	makeQueryFunction(findAll, queryTemplate, sortMap, filterConfig, failOnCondition, nsParams, config)

(The last three of there parameters are all optional.)

Makes and returns a function, suitable to be used as the `query` param of a stripes-connect resource configuration. The function is itself configured by five parameters, which will vary depending on the module that is using it, and will use these to determine how to interpret the query, filters and sort-specification in the application state. It is generally used as follows:
```
static manifest = Object.freeze({
  items: {
    type: 'okapi',
    records: 'items',
    path: 'item-storage/items',
    params: {
      query: makeQueryFunction(
        'cql.allRecords=1',
        'materialType="${query}" or barcode="${query}*" or title="${query}*"',
        { 'Material Type': 'materialType' },
        filterConfig,
        2
      ),
    },
    staticFallback: { params: {} },
  },
});
```

The six parameters are:

* `findAll` -- a CQL string that can be used to find all records, for situations where no query or filters are specified and the application wants all records to be listed.
* `queryTemplate` -- a CQL string into which the query and other data can be substituted, using the same syntax as [path substitution in stripes-connect](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md#text-substitution): for example, `?{query}` interpolates the `query` parameter from the URL.
* `sortMap` -- an object mapping the names of columns in the display to the CQL sort-specifiers that they should invoke when clicked on.
* `filterConfig` -- the configuration of the application's filter as passed to [the `<FilterGroups>` component](../lib/FilterGroups/readme.md#filter-configuration).
* `failOnCondition` -- an optional indicator of how to behave when no query and/or filters are provided. Can take the following values:
  * `0`: do not fail even if query and filters and empty
  * `1`: fail if query is empty, whatever the filter state
  * `2`: fail if both query and filters and empty.

  For backwards compatibility, `false` (or omitting the argument altogether) is equivalent to `0` , and `true` is equivalent to `1`.
* `nsParams` -- namespace keys
* `config` -- an object containing configuration parameters:
  * `escape` (boolean): whether to escape quote and backslash values in the query [default: `true`]
  * `rightTrunc` (boolean): whether to append `*` to query terms [default: `true`].

  For backslash compatibility, a boolean value may be passed instead of the config structure: this is used as the `escape` configuration value.



## Components for filtering

Please, pay attention, there is a set of components to be used for filtering inside SearchAndSort component. Each component represents a wrapper on existing form element component e.g. MultiSelect or renders a set of elements working like one filter e.g. CheckboxFilter. After change returns data in format: {name: <String>, values: <ArrayOfObjects>}, where name -- is a filter name and values -- filter values.


## Implementing filters

See the separate document [_Building filters for your Stripes app_](building-filters.md).
