# Change history for stripes-smart-components

## 1.5.0 (IN PROGRESS)

* Removed unused packages from package.json. Refs STRIPES-490.
* Upgrade `<SearchAndSort>` to use new filter-related APIs. Fixes STSMACOM-35 and resolves STRIPES-493.
* Store local changes to search term in component state, and render from that. Fixes STSMACOM-33.
* Fix regression: reset-search button had stopped working. Fixes STSMACOM-36.
* Emit "Loading..." message rather than "no hits" before search-results arrive. Fixes STSMACOM-38.
* Correctly reset query value when clearing search results. Fixes STSMACOM-39.
* Pass requested props on through to the detail view. Toward UIIN-34.
* Support the `<MultiColumnList>` property `columnWidths`. Fixes STSMACOM-40.
* `<SearchAndSort>` passes `searchableIndexes`, `selectedIndex` and `onChangeIndex` through to `<FilterPaneSearch>`. Fixes STSMACOM-41.
* `EntryManager` uses "Create ${item}" instead of "New ${item}". Refs UICIRC-20
* First draft of GitHub style @at-mention username autocompletion. Refs STSMACOM-4.

## [1.4.0](https://github.com/folio-org/stripes-smart-components/tree/v1.4.0) (2017-11-29)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.3.0...v1.4.0)

* Remove `search` URL parameter from `<SearchAndSort>`. Fixes STSMACOM-27.
* `<SearchAndSort>` honours the "initialPath" property. Fixes STSMACOM-28.
* `<SearchAndSort>` removes all existing anointed-resource properties when resetting the search. Fixes STSMACOM-30.
* `<SearchAndSort>` no longer replicates URL state in component state. Fixes STSMACOM-29.

## [1.3.0](https://github.com/folio-org/stripes-smart-components/tree/v1.3.0) (2017-11-28)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.2.0...v1.3.0)

* Status of notes pane is now reflected in the URL: the `notes` part of the query may be absent for no notes pane, `true` to display it, or the UUID of a specific note. Fixes STSMACOM-19.
* `<SearchAndSort>` made less stringent in which properties are required, so that it now supports read-only modules with no need for editing or new-record creation. Fixes STSMACOM-24.
* `<SearchAndSort>` temporarily sets both `query` and `search` URL parameters. Fixes STSMACOM-25; see rationale in comments to  UISE-13.

## [1.2.0](https://github.com/folio-org/stripes-smart-components/tree/v1.2.0) (2017-11-23)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.1.0...v1.2.0)

* `<EntryManager>` uses "Create ${item}" instead of "New ${item}". Refs UICIRC-20.
* Add generic `<SearchAndSort>` component. Fixes STSMACOM-21.
* Add [documentation for `<SearchAndSort>`](lib/SearchAndSort/readme.md). Fixes STSMACOM-22.
* Downgrade `stripes-logger` from a true dependency to a peer-dependency.
* Upgrade Stripes dependencies:
  * stripes-components 1.8.0 to 1.9.0
  * stripes-form 0.8.0 to 0.8.1
  * stripes-connect 2.3.0 to 3.0.0-pre.1
  * stripes-core 1.13.0 to 2.8.0

## [1.1.0](https://github.com/folio-org/stripes-smart-components/tree/v1.1.0) (2017-11-09)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.0.1...v1.1.0)

* Cleanup `package.json`; this is not a Stripes Module. Fixes STSMACOM-9.
* Show `<Note>` author's name, not their UUID. Fixes STSMACOM-5.
* `<EntryManager>` helps manage CRUD operations. Fixes STSMACOM-12.
* `<EntryManager>` passes along `validate()` function. Fixes STSMACOM-15.
* `<EntryManager>` sets detail-pane title based on selected entry. Refs UICIRC-20 Scenario 5
*  Add `defaultEntry` to `<EntryManager>`. Fixes STSMACOM-18.

## [1.0.1](https://github.com/folio-org/stripes-smart-components/tree/v1.0.1) (2017-10-11)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v0.3.0...v1.0.1)

* Change NPM module name to stripes-smart-components. Fixes STSMACOM-7.

## [0.3.0](https://github.com/folio-org/stripes-util-notes/tree/v0.3.0) (2017-10-11)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v0.2.0...v0.3.0)

* Add `<ControlledVocab>`. Fixes the stripes-smart-components part of STSMACOM-6
* Upgrade stripes-components dependency to v1.8.

## [0.2.0](https://github.com/folio-org/stripes-util-notes/tree/v0.2.0) (2017-10-04)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v0.1.0...v0.2.0)

* Refactor all components out of `stripes-components`. STSMACOM-2.

## [0.1.0](https://github.com/folio-org/stripes-util-notes/tree/v0.1.0) (2017-09-07)

* First version to have a documented change-log. Each subsequent version will
  describe its differences from the previous one.
