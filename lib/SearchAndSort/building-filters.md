# Building filters for your Stripes app

<!-- md2toc -l 2 building-filters.md -->
* [Introduction](#introduction)
* [Representation](#representation)
    * [Representation in the URL](#representation-in-the-url)
    * [Representation in memory](#representation-in-memory)
* [Strategy](#strategy)
    * [1. Render the filters in our own code](#1-render-the-filters-in-our-own-code)
    * [2. Populate initial selected values from `filters`](#2-populate-initial-selected-values-from-filters)
    * [3. On interaction, go to a URL with modified `filters`](#3-on-interaction-go-to-a-url-with-modified-filters)
    * [4. Configure the query-generating function](#4-configure-the-query-generating-function)
* [Example: `ui-directory`](#example-ui-directory)
    * [Stage 1.](#stage-1)
    * [Stage 2.](#stage-2)
    * [Stage 3.](#stage-3)
    * [Stage 4.](#stage-4)
* [Conclusion](#conclusion)



## Introduction

As with so many things in the world of Stripes, there are several different ways to add filters to your app. Just as the main app framework can be provided by [`<SearchAndSort>`](readme.md) or [`<SearchAndSortQuery>`](SearchAndSortQuery.md) &mdash; which provide broadly equivalent capabilities but with very different APIs &mdash; so filters can be implemented using [`<FilterGroups>`](https://github.com/folio-org/stripes-components/blob/master/lib/FilterGroups/readme.md) augmented with `initialFilterState` and `filters2cql`, or using `filterState` instead of `initialFilterState`, and with either `onChangeFilter` or `handleFilterChange`, and so the options go on.

As helpful as these approaches can be, they all have a tendency to break down once you start wanting to use more complex kinds of filters, such as the [`<MultiSelectionFilter>`](components/MultiSelectionFilter/MultiSelectionFilter.js) control that lets you search within a large vocabulary of potential filter values. Given the potentially bewildering variety of APIs that can be used and
the flexibility that inevitably becomes necessary, the best solution may be to roll one's own filters from parts.



## Representation


### Representation in the URL

There are several functions that can be used in a stripes-connect `manifest` entry to generate a query for the back-end based on the contents of the URL's query parameters. [`makeQueryFunction`](readme.md#makequeryfunction) generates CQL, suitable for submitting to [RMB](https://github.com/folio-org/raml-module-builder)-based back-end modules; [`getSASparams`](https://github.com/folio-org/stripes-erm-components/blob/master/lib/getSASParams.js) does a similar job for back-end modules that use Knowlege Integration's Grails-based back-end; and [`generateQueryParams`](https://github.com/folio-org/stripes-erm-components/blob/master/lib/generateQueryParams.js) is a newer alternative. Fortunately all three use the same representation of filters in the URL:

* a single URL query parameter called `filters`,
* consisting of a comma-separated series of entries,
* each of the form `key`.`value`,
* where multiple entries may share the same key (but different values)

So a URL containing `filters=state.REQ_CANCELLED,state.REQ_END_OF_ROTA,supplier.123` specifies three values:

* key `state`, value `REQ_CANCELLED`
* key `state`, value `REQ_END_OF_ROTA`
* key `supplier`, value `123`

(The generated query finds records that have _any_ of the values specified for each key that is mentioned: so in the example above, something like `state=(REQ_CANCELLED or REQ_END_OF_ROTA) and supplier=123`.)


### Representation in memory

The various utility functions mentioned above all deal with this representation in one way or another, but the simplest way to address it is with [the `parseFilters` and `deparseFilters` functions](parseFilters.js), which convert from this string representation to an in-memory structure that is easy to manipulate, and back again.

The in-memory structure is an objects whose keys are those that are mentioned in the filter string, and whose corresponding values are arrays containing all of the values specified for each key. So:

	const filters = 'state.REQ_CANCELLED,state.REQ_END_OF_ROTA,supplier.123';
	console.log('filters =', filters);
	const struct = parseFilters(filters);
	console.log('struct =', struct);
	const res = deparseFilters(struct);
	console.log('res =', res);

Yields:

	filters = state.REQ_CANCELLED,state.REQ_END_OF_ROTA,supplier.123
	struct = { state: [ 'REQ_CANCELLED', 'REQ_END_OF_ROTA' ], supplier: [ '123' ] }
	res = state.REQ_CANCELLED,state.REQ_END_OF_ROTA,supplier.123



## Strategy

Here is how we will build the filtering code for our app:

1. Render the filters in our own code
2. Populate initial selected values from `filters`
3. On interaction, go to a URL with modified `filters`
4. Configure the query-generating function

We do not use component state &mdash; the URL _is_ the state. And we do not use a `filterConfig` structure.

Now let's look at these steps in more detail.


### 1. Render the filters in our own code

We will render the filters in our own code rather that having it it done by a library component (which is likely to be insufficiently flexible). When using `<SearchAndSortQuery>`, it's easy to include a component that renders the filters; but `<SearchAndSort>` also has a facility for doing this: you can pass in a `renderFilters` prop whose value is a function that will be invoked to render the filters, in place of those that would otherwise be generated from a filter-config.

Rendering the filter involves generating the lists of candidate values, which can itself be a complex procedure. For that reason, it is sometimes best to have the `renderFilters` function simply assemble the lists of candidate values, then pass those through to a `renderFiltersFromData` function that uses those lists to render the actual controls: `<Select>`s, sets of `<Checkbox>`es, `<MultiSelectionFilter>`s, `<Datepicker>`s or whatever else is useful.

It is necessary to provide the callback functions that are invoked when the user interacts with a control: see stage 3 for this.


### 2. Populate initial selected values from `filters`

When rendering the filter controls, we have to populate their initial selected values from the `filters` specified in the URL. This is simple to do: we just get the `filters` parameter from [the special stripes-connect resource `query`](https://github.com/folio-org/stripes/blob/master/doc/dev-guide.md#url-navigation), parse it with `parseFilters`, and use the arrays in the resulting object to populate the initial value of each control.

	import { parseFilters, deparseFilters } from '@folio/stripes/smart-components';
	const byName = parseFilters(get(resources.query, 'filters'));
	const values = {
	  institution: byName.supplier || [],
	  // ... and other values
	};

	// Then, later:
	<MultiSelectionFilter
	  name="supplier"
	  dataOptions={options.institution}
	  selectedValues={values.institution}
	  onChange={setFilterState}
	/>
	// ... and others filter controls

(The `<MultiSelectionFilter>` control takes an array of scalars as its values; sets of `<Checkbox>`es can also be populated by these arrays. Most other controls will expect a single value.)


### 3. On interaction, go to a URL with modified `filters`

When the user interacts with a filter, a callback function is called &mdash; `setFilterState` in the example above. The function should use the event target that is its argument to find the chosen value, then modify the parsed filter structure accordingly, then deparse the structure into a new filter string, and finally navigate to the URL with the modified value of `filters`. This navigation can most conveniently be achieved by mutating the special stripes-connect resource `query`, so:

	const setFilterState = (group) => {
	  if (group.values === null) {
	    delete byName[group.name];
	  } else {
	    byName[group.name] = group.values;
	  }
	  mutator.query.update({ filters: deparseFilters(byName) });
	};

It is not necessary to labouriously track filter changes in local component state, as some of the existing solutions do: the URL _is_ the state, containing everything necessary to render the filters and capable of capturing every change that the user can make to them.


### 4. Configure the query-generating function

Steps 1 to 3 above suffice to maintain the value of the `filters` parameter in the URL. The last step is for the query-generation function &mdash; usually generated by one of `makeQueryFunction`, `getSASparams` or `generateQueryParams` &mdash; to turn that filter string into a query for the back-end module. In general these functions do the right thing, but some configuration is necessary to ensure that the queries use the correct indexes.

For `getSASparams` and `generateQueryParams`, this is done using the `filterKeys` entry in the configuration object. This is an object whose values are filter names as they appear in the `filters` string in the URL, and whose values are the corresponding back-end indexes to search in.

For example, the `supplier` key in the example above might provide values to be searched for in the `resolvedSupplier.owner.id` field. This would be specified by providing a `manifest` entry whose parameters are generated as follows:

	params: generateQueryParams({
	  filterKeys: {
	    'supplier': 'resolvedSupplier.owner.id',
	  },
	}),

In `generateQueryParams`, if you omit the filterKey for a key in the query, only the value will be passed through to the backend. This is useful if you want to use an operation other than ==. For example, if you have `'foo': 'bar'` in your `filterKeys` and something like `foo.42` in your URL it will send that as `bar==42` but you could make a comparison by omitting foo from `filterKeys` and setting the value as `bar>42`. That will show up in the URL as `foo.bar>42` and be sent as `bar>42`.

## Example: `ui-directory`

[The `ui-directory` module](https://github.com/openlibraryenvironment/ui-directory) provides a means to maintain the directory of libraries, branches and consortia in the [ReShare](https://projectreshare.org/) resource-sharing platform. As of [commit 84f94d0a](https://github.com/openlibraryenvironment/ui-directory/tree/84f94d0a3414577fbb4903344d09ce4712d19d6e) of 7 April 2020, the whole of the filtering code is in a single source file, [the top-level routing component](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js), which makes it easy to understand for tutorial purposes. It provides two multi-select filters named `type` and `tags`.

Here are the parts of the code that implement the four stages in the strategy above:


### Stage 1.

* [Line 284](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L284) passes the `renderFilters` method into `<SearchAndSort>`
* [Lines 215-224](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L215-L224) implement this function, gathering candidate values for the two filters and passing them into `renderFiltersFromData`.
* [Lines 166-204](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L166-L204) implement `renderFiltersFromData` which actually render the filters. This is where most of the real work is done.


### Stage 2.

* The first thing `renderFiltersFromData` does is to parse the `filters` string, deriving an in-memory representation, and use this to derive a set of `values` ([lines 168-173](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L168-L173)).
* These values are used to provide the current selections in the `<MultiSelectionFilter>` ([line 199](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L199)).


### Stage 3.

* [Line 200](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L200) specifies that when a filter control changes, the `setFilterState` method should be called.
* [line 194](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L194) provides a callback for clearing the filter completely: the very simple `clearGroup` function provided in [line 183](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L183), which merely invokes `setFilterState` with an empty set of values.
* `setFilterState` ([lines 175-182](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L175-L182)) simply modifies the parsed filter representation, then in its last line updates the special stripes-connect resource `query` to set the `filters` parameter to the result of deparsing the modified in-memory representation of the filters.


### Stage 4.

* The code we have seen so far arranges for the `filters` parameter of the URL to contain values for filters named `type` and `tags`. The `filterKeys` parameter of the `getSASparams` function ([lines 54-57](https://github.com/openlibraryenvironment/ui-directory/blob/84f94d0a3414577fbb4903344d09ce4712d19d6e/src/routes/DirectoryEntries.js#L54-L57]) specifies how to translate those filter-names into queriable indexes.

The result of all this is that if the user, for example, selects two tags, "storage" and "pickup", then the URL will contain the `filters` parameter `tags.Storage,tags.Pickup`, and the corresponding back-end query will be generated: `/directory/entry?filters=tags.value%3D%3DStorage%7C%7Ctags.value%3D%3DPickup`.




## Conclusion

This approach to providing filters has the following benefits:

* The code is simple and easy to follow.
* There is little "magic" involved &mdash; the reason for each piece of code is readily apparent.
* It is easy to extend the filter pane with any combination of controls.



