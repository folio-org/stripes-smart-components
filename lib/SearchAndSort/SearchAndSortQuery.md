# `<SearchAndSortQuery>`

A non-presentational version of SearchAndSort, it focuses on assisting with glue code surrounding the Search/Filter pattern that's common among FOLIO apps. This leaves the presentation open to modification for requirements.

## Query state...
`<SearchAndSortQuery>` stores a query as 3 separate slices of its internal state: `searchFields`, `sortFields`, and `filterFields`. Ultimately these are transformed into a single query string and applied as query parameters. The method of transformation is adjustable via props, with the most typical case supplied by default.

## Render Props

This component supplies change handlers and values for search and filter controls via render-props. It accepts a function as a child, and the supplied render-prop parameters are assigned to the children therein.

Name | member | type | description
--- | --- | --- | ---
getSearchHandlers | | func | returns an object of search handlers.
| | getSearchHandlers().query | func | event handler for inputs - accepts and event and assigns the value to a field of the component's 'name' attribute.
| | getSearchHandlers().state | func | event handler that accepts an object to set as the 'search' slice of internal state.
searchValue | | object |  returns the 'search' slice of internal state,
onSubmitSearch | | func | onClick handler for search buttons.
getFilterHandlers | | func | returns an object of filter handlers.
| | getFilterHandlers().state | func | accepts an object to set as the 'filterFields' slice of internal state.
| | getFilterHandlers().clear | func | convenience handler for clearing filters.
| | getFilterHandlers().checkbox | func | convenience handler for checkboxes/radio button controls.
activeFilters | | func | returns an object of active filters in a variety of formats,
| | activeFilters().state | object | the current `filterFields` slice of internal state.
| | activeFilters().string | string | string representation of filters.


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
