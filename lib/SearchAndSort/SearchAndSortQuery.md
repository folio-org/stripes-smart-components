# `<SearchAndSortQuery>`

A non-presentational version of SearchAndSort, it focuses on assisting with glue code surrounding the Search/Filter pattern that's common among FOLIO apps. This leaves the presentation open to modification for requirements.

## Query state...
`<SearchAndSortQuery>` stores a query as 3 separate slices of its internal state: `searchFields`, `sortFields`, and `filterFields`. Ultimately these are transformed into a single query string and applied as query parameters. The method of transformation is adjustable via props, with the most typical case supplied by default. The typical query shape of SearchAndSort apps within the FOLIO ecosystem currently resembles the following.
```
{
  searchFields: {
    query: '',
  },
  filterFields: {
    filters: '<group>.<filtername>, ...',
  },
  sortFields: {
    sort: '<fieldName>`,
  }
}
```
If the user has searched for 'ba', filtered by 'faculty' and 'staff' under the 'patron group' (pg) group, and the list is sorted by name, the generated query string for this appears as `filters=pg.faculty%2Cpg.staff&query=ba&sort=name`.

## Render Props

This component supplies change handlers and values for search and filter controls via render-props. It accepts a function as a child, and the supplied render-prop parameters are assigned to the children therein.

Name | member | type | description
--- | --- | --- | ---
`getSearchHandlers` | | func | returns an object of search handlers.
| | `getSearchHandlers().query` | func | event handler for inputs - accepts and event and assigns the value to a field of the component's 'name' attribute.
| | `getSearchHandlers().state` | func | event handler that accepts an object to set as the 'search' slice of internal state.
| | `getSearchHandlers().reset` | func | event handler for resetting searchFields back to an initial state.
`searchValue` | | object |  returns the 'search' slice of internal state,
`onSubmitSearch` | | func | for search triggers
`getFilterHandlers` | | func | returns an object of filter handlers.
| | `getFilterHandlers().state` | func | accepts an object to set as the 'filterFields' slice of internal state.
| | `getFilterHandlers().clear` | func | convenience handler for clearing filters.
| | `getFilterHandlers().clearGroup` | func | convenience handler for clearing `<FilterGroups>` - the function accepts a 'name' for the filter and clears that key in the query state.
| | `getFilterHandlers().checkbox` | func | convenience handler for checkboxes/radio button controls.
| | `getFilterHandlers().reset` | func | convenient for reseting filters back to an initial state, rather than clearing them.
`activeFilters` | | object | an object of active filters in a variety of formats,
| | `activeFilters.state` | object | the current `filterFields` slice of internal state.
| | `activeFilters.string` | string | string representation of filters.
`resetAll` | | func | convenient handler for resetting search, filters, and sorting to 'initial values'
`filterChanged` | bool | Boolean whether or not filters are different from their defaults. Useful for displaying 'reset' controls.
`searchChanged` | bool | Similar to `filterChanged` for search criteria.
`sortChanged` | bool | Similar to `filterChanged` for sort fields.

## Props

`<SearchAndSortQuery>` allows you to override its functionality as needed to suit your module's needs.

Name | type | description | required | default
--- | --- | --- | --- | ---
`children` | func | the child function that accepts the render props. | :check |
`filtersToString` | func | prop to convert the `filterFields` slice of state to a string for query building. Has to return a string. | | Generates comma-separated lit of `<name>.<value>` pairs. E.G. `pg.faculty,pg.staff,pg.student`
`filterParamsMapping` | object | Object containing key/function pairs for converting existing filters to query state. InitializeFilters converts the array of `group.filtername` to an object keyed on groups with arrays of the active. | | `{ 'filters': initializeFilters }`
`initialSearch` | string | The initial query that should initialize the component. | |
`initialSearchState` | object | sets up the inital state of the `searchFields` slice of query state. | |
`initialFiltersState` | object | sets up the inital state of the `filterFields` slice of query state. | |
`initialSortState` | object | sets up the initial state of the `sortFields` slice of query state. | |
`maxSortKeys` | number | If provided, specifies that maximum number of sort-keys that should be remembered for "stable sorting". | | 2
`sortableColumns` | array | If provided, specifies the columns that can be sorted.
`nsParams` | string, object | For instances where namespacing params due to a shared query string is necessary. A string will place the string in front of the parameter separated by a dot. An object can be used for name-spacing on a per-parameter basis. | |
`onComponentWillUnmount` | func | for performing any necessary cleanup when the component dismounts. | | The component alone will reset the query to the initial query.
`queryGetter` | func | An adapter function called internally for querying parameters. Its passed the an object containing the `location` object from react-router. | | By default, it returns the search key of location, parsed via `queryString.parse`
`querySetter` | func | An adapter function for applying your query. It's passed an object with `location`, `history` object, `values` (pre and post namespace), as well as the internal `state` of the component - all potentially useful for constructing and applying your query. | | By default it builds the url and applies it via `history.push`
`searchParamsMapping` | object | Object containing key/function pairs for converting pre-existing search parameters to query state | | `{ 'query': v => v }`
`sortParamsMapping` | object | Object containing key/function pairs for converting pre-existing sorting parameters to query state. | | `{ 'sort': v => v }`
`queryStateReducer` | func | Powerful function that allows for manipulation of the internal state of the component with each change. Simply return the state that you need to be set. | | `(curState, nextState) => nextState`
`searchChangeCallback`, `filterChangeCallback`, `sortChangeCallback` | func | Callbacks to apply other updates within your application when their corresponding slice of internal state.
`syncToLocationSearch` | bool | If `false`, this component will not update based on changes to the browser's location. This is ideal for sub-module searches and plug-ins that work solely of local resources and do not affect the browsers' location. With the `true` setting, this component will respond to changes in the browser's query string - this works with direct linking and resetting via link. | | `true`

## Example Usage

```
<SearchAndSortQuery
  querySetter={this.querySetter}
  queryGetter={this.queryGetter}
  onComponentWillUnmount={onComponentWillUnmount}
  initialSearchState={{ query: '' }}
>
  {
    ({
      searchValue,
      getSearchHandlers,
      onSubmitSearch,
      onSort,
      getFilterHandlers,
      activeFilters,
    }) => (
      <div>
        <TextField
          label="user search"
          name="query"
          onChange={getSearchHandlers().query}
          value={searchValue.query}
        />
        <Button onClick={onSubmitSearch}>Search</Button>
        <Filters
          onChangeHandlers={getFilterHandlers()}
          activeFilters={activeFilters}
          config={filterConfig}
          patronGroups={patronGroups}
        />
        <IntlConsumer>
          { intl => (
            <MultiColumnList
              visibleColumns={this.props.visibleColumns ? this.props.visibleColumns : ['status', 'name', 'barcode', 'patronGroup', 'username', 'email']}
              contentData={get(resources, 'records.records', [])}
              columnMapping={{
                status: intl.formatMessage({ id: 'ui-users.active' }),
                name: intl.formatMessage({ id: 'ui-users.information.name' }),
                barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
                patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
                username: intl.formatMessage({ id: 'ui-users.information.username' }),
                email: intl.formatMessage({ id: 'ui-users.contact.email' }),
              }}
              formatter={resultsFormatter}
              rowFormatter={this.anchorRowFormatter}
              onRowClick={onSelectRow}
              onNeedMore={this.onNeedMore}
              onHeaderClick={onSort}
            />
          )}
        </IntlConsumer>
      </div>
    )
  }
</SearchAndSortQuery>
```

## Using QueryGetter and QuerySetter
These are adapter functions used to get and set your your query according to your particular modules needs. Some modules may use the window location (default functionality), others may need to update the query via the mutator (local resource.) A basic example: using the local resource...

```
// nsValues simply return the base value name if no namespacing is provided.
  querySetter = ({ nsValues }) => {
    this.props.mutator.query.update(nsValues);
  }

  queryGetter = () => {
    return get(this.props.resources, 'query', {});
  }
```

## changeType
The query state contains a field named `changeType` that relays information about which particular action triggered a state change. This status is relayed out to `queryStateReducer` as well as `querySetter` so that logic can differ there if it needs to. For example, in instances where a user resets their search and filters, you may opt to replace a query rather than just update it:

```
querySetter = ({ nsValues, state }) => {
    if (/reset/.test(state.changeType)) {
      this.props.mutator.query.replace(nsValues);
    } else {
      this.props.mutator.query.update(nsValues);
    }
  }
```

## queryStateReducer
This function allows you ultimate control over the internal query state with every change. It's necessary to maintain the `searchFields`,`filterFields`,`sortFields` keys, but otherwise, you can update internal state and subfields however you'd like. The `nextState.changeType` field allows you branch logic as needed depending on the cause of the change. For a contrived example, have a filter modify sorting in a particular way...

```
const filterSort = (curState, nextState) => {
  const stateToSet = cloneDeep(nextState);
  switch (nextState.changeType) {
    case 'filter.state':
      if (nextState.filterFields.alpha.length > 0) {
        stateToSet.sortFields.direction = 'ascending';
      }
      break;
    default:
      return nextState;
  }
  return stateToSet;
}
```

## Initializing the query state
By default, `<SearchAndSortQuery>` will initialize its query state using its 'location' prop - this comes from the url in the address bar. SearchAndSort-based modules include their default queries in their 'home' url ex: `/users?sort=name`.
If using the local resource strictly for your query string (typical plugin behavior), you can set the `syncToLocationSearch` prop to `false` and supply an `initialSearch` prop with the search string beginning with `?` - ex: `initialSearch="?sort=name"`

## Resetting
`<SearchAndSortQuery>` will use the `initialSearch` prop to reset its query state for any 'reset' functionality for filters and search criteria.

## Parameter mapping
Three props: `searchParamsMapping`, `filterParamsMapping`, `sortParamsMapping` allow for you to inform `SearchAndSortQuery` how to derive query state based on pre-existing query params. Defaults for the props are provided that conform to FOLIO's most common case.
This is a contrived example using a custom query string structure:
```
https://not-a-real-thing/search?name=blue&startdate=03%2F05%2F1996&enddate=09%2F04%2F2003&countries=paraguay%2Cmexico%2Ccanada&sort=name&direction=true
```

```
// these can be reusable...
const clone = v => v;

{
  <SearchAndSortQuery
    searchParamsMapping={{
      name: clone,
      startdate: clone,
      enddate: clone,
    }}
    filterParamsMapping={{
      countries: v => v.split(','),
      type: clone,
    }},
    sortParamsMapping={{
      sort: clone,
      direction: v => v === 'true' ? 'ascending' : 'descending',
    }},
  >
    {(...render) => (children(...render))}
  </SearchAndSortQuery>
}
```

### Using a slice of `initialState`
Blank values are a use-case that may not be captured at all in `initialSearch` or the location query. Internal logic removes these values before applying them to the browser location, so they cannot be derived from the location itself - so we need another means to do so. `initialSearchState`, `initialFilterState` and `initialSortState` are all props that, as their name suggests, supply the component with a default query state for **initialization and resets** - this includes a way to apply blank values - or any value if it isn't present in the browser location.
```
<SearchAndSortQuery
  initialSortState={{ sort: 'name' }}
  initialSearchState={{ query: '', qindex: '' }}
> ...
</SearchAndSortQuery>
```

## The `<Filter>` component

The `<Filter>` component shown in the example is a per-module component that's dedicated to rendering filter controls and supplying their lowest level handling needs internally. It isn't always necessary, but a nice way to tuck filter UI into the code. It ideal for it to accept the `filterFields` slice of the state as it's single source of truth for its values and speak back to `SearchAndSortQuery` via the `getFilterHanders().state` handler to apply updates back to the component.

## Migrating with FilterGroups

`<FilterGroups>` are the default filter component rendered by `<SearchAndSort>` They render based on a `filterConfig` object and form a nice boolean filter set-up within most FOLIO apps. Migrating to this, `<FilterGroups>` from stripes-components will accept the application's filter config (`config` prop), and an object with boolean keys - `true` for each active filter (`filters` prop), and a handler for clearing the group via its clear button on the accordion header.
Here's a snippet from within the `<Filters>` component of `ui-plugin-find-user` that uses `<FilterGroup>`. The `activeFilters` and `onChangeHandlers` props come straight from the render props of `<SearchAndSortQuery>`.

```
  const {
      activeFilters,
      onChangeHandlers: { checkbox, clearGroup },
      config,
    } = this.props;

    const groupFilters = {};
    activeFilters.string.split(',').forEach(m => { groupFilters[m] = true; });

    return (
      <FilterGroups
        config={config}
        filters={groupFilters}
        onChangeFilter={checkbox}
        onClearFilter={clearGroup}
      />
    );
```
