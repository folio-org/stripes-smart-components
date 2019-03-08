# `<SearchAndSortQuery>`

A non-presentational version of SearchAndSort, it focuses on assisting with glue code surrounding the Search/Filter pattern that's common among FOLIO apps. This leaves the presentation open to modification for requirements.

## Query state...
`<SearchAndSortQuery>` stores a query as 3 separate slices of its internal state: `searchFields`, `sortFields`, and `filterFields`. Ultimately these are transformed into a single query string and applied as query parameters. The method of transformation is adjustable via props, with the most typical case supplied by default.

## Render Props

This component supplies change handlers and values for search and filter controls via render-props. It accepts a function as a child, and the supplied render-prop parameters are assigned to the children therein.

Name | member | type | description
--- | --- | --- | ---
`getSearchHandlers` | | func | returns an object of search handlers.
| | `getSearchHandlers().query` | func | event handler for inputs - accepts and event and assigns the value to a field of the component's 'name' attribute.
| | `getSearchHandlers().state` | func | event handler that accepts an object to set as the 'search' slice of internal state.
`searchValue` | | object |  returns the 'search' slice of internal state,
`onSubmitSearch` | | func | for search triggers
`getFilterHandlers` | | func | returns an object of filter handlers.
| | `getFilterHandlers().state` | func | accepts an object to set as the 'filterFields' slice of internal state.
| | `getFilterHandlers().clear` | func | convenience handler for clearing filters.
| | `getFilterHandlers().checkbox` | func | convenience handler for checkboxes/radio button controls.
`activeFilters` | | func | returns an object of active filters in a variety of formats,
| | `activeFilters().state` | object | the current `filterFields` slice of internal state.
| | `activeFilters().string` | string | string representation of filters.

## Props

`<SearchAndSortQuery>` allows you to override its functionality as needed to suit your module's needs.

Name | type | description | required | default 
--- | --- | --- 
`children` | func | the child function that accepts the render props. | :check | 
`filtersToString` | func | prop to convert the `filterFields` slice of state to a string for query building. Has to return a string. | | Generates comma-separated lit of `<name>.<value>` pairs. E.G. `pg.faculty,pg.staff,pg.student`
`initialSearch` | string | The initial query that should initialize the component. | | 
`maxSortKeys` | number | If provided, specifies that maximum number of sort-keys that should be remembered for "stable sorting". | | 2
`nsParams` | string, object | For instances where namespacing params due to a shared query string is necessary. A string will place the string in front of the parameter separated by a dot. An object can be used for name-spacing on a per-parameter basis. | | 
`onComponentWillUnmount` | func | for performing any necessary cleanup when the component dismounts. | | The component alone will reset the query to the initial query.
`queryGetter` | func | An adapter function called internally for querying parameters. Its passed the an object containing the `location` object from react-router. | | By default, it returns the search key of location, parsed via `queryString.parse` 
`querySetter` | func | An adapter function for applying your query. It's passed an object with `location`, `history` object, `values` (pre and post namespace), as well as the internal `state` of the component - all potentially useful for constructing and applying your query. | | By default it builds the url and applies it via `history.push`
`queryStateReducer` | func | Powerful function that allows for manipulation of the internal state of the component with each change. Simply return the state that you need to be set. | | `(curState, nextState) => nextState`
`searchChangeCallback`, `filterChangeCallback`, `sortChangeCallback` | func | Callbacks to apply other updates within your application when their corresponding slice of internal state.

## Example Usage

```
<SearchAndSortQuery
  querySetter={this.querySetter}
  queryGetter={this.queryGetter}
  onComponentWillUnmount={onComponentWillUnmount}
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

## queryStateReducer
This function allows you ultimate control over the internal query state with every change. It's necessary to maintain the `searchFields`,`filterFields`,`sortFields` keys, but otherwise, you can update internal state and subfields however you'd like. For a contrived example, have a filter modify sorting in a particular way...

```
const filterSort = (curState, nextState) => {
  const stateToSet = cloneDeep(nextState);
  switch (nextState.change) {
    case 'filter': 
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

## The `<Filter>` component
The `<Filter>` component shown in the example is a per-module component that's dedicated to rendering filter controls and supplying their lowest level handling needs internally. It isn't always necessary, but a nice way to tuck filter UI into the code. It ideal for it to accept the `filterFields` slice of the state as it's single source of truth for its values and speak back to `SearchAndSortQuery` via the `getFilterHanders().state` handler to apply updates back to the component. 
