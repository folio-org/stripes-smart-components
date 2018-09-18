# Change history for stripes-smart-components

## ## 1.9.0 (IN PROGRESS) 
* Fix tags autosuggest subsort. Fixes STSMACOM-123.
* Update `stripes-form` dependency to v1.0.0

## [1.8.0](https://github.com/folio-org/stripes-smart-components/tree/v1.8.0) (2018-09-17)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.7.1...v1.8.0)

* Add missing components to index.js exports

## [1.7.1](https://github.com/folio-org/stripes-smart-components/tree/v1.7.1) (2018-09-13)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.7.0...v1.7.1)

* Additional German, Portuguese translations.

## [1.7.0](https://github.com/folio-org/stripes-smart-components/tree/v1.7.0) (2018-09-13)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.5.0...v1.7.0)

* Migrate components from stripes-components: `AddressFieldGroup`, `EditableList`, `Settings`. `makeQueryFunction`, `nsQueryFunctions`. Refs STCOM-298, STCOM-322.
* Use `MultiSelection` for tags. Part of STSMACOM-113.
* Fixed `SearchAndSort` row URL creation for subapps (e.g., `/finance/funds`).
* Fix sorting of filtered items. Introduce Callout for new tags. Part of STSMACOM-113.
* Clean up old babel dependencies, et al. Refs STCOR-230.

## [1.5.0](https://github.com/folio-org/stripes-smart-components/tree/v1.5.0) (2018-09-05)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.4.0...v1.5.0)

* Removed unused packages from package.json. Refs STRIPES-490.
* Upgrade `<SearchAndSort>` to use new filter-related APIs. Fixes STSMACOM-35 and resolves STRIPES-493.
* Store local changes to search term in component state, and render from that. Fixes STSMACOM-33.
* Fix regression: reset-search button had stopped working. Fixes STSMACOM-36.
* Emit "Loading..." message rather than "no hits" before search-results arrive. Fixes STSMACOM-38.
* Correctly reset query value when clearing search results. Fixes STSMACOM-39.
* Pass requested props on through to the detail view. Toward UIIN-34.
* Support the `<MultiColumnList>` property `columnWidths`. Fixes STSMACOM-40.
* `<SearchAndSort>` passes `searchableIndexes`, `selectedIndex` and `onChangeIndex` through to `<FilterPaneSearch>`. Fixes STSMACOM-41.
* `<SearchAndSort>`'s clear-search button now clears only the query, leaving the filters and sort-order untouched. Fixes STSMACOM-42.
* Cleanup `<EntryForm>`. Fixes STSMACOM-43.
* `<SearchAndSort>`'s Filters pane can now be toggled between open and closed. Refs STCOM-164.
* When a search result is winnowed to one record, show it. Fixes UIIN-58.
* In record-display area, distinguish between loading, error and neither. Fixes STSMACOM-46.
* In `<SearchAndSort>`, allow the maximum number of sort-keys to be specified by the new `maxSortKeys` property. Fixes STSMACOM-45.
* Support the optional `filterChangeCallback` property, a function that is passed the filter state when it changes. Fixes STSMACOM-47.
* Fall back to rendering full record if `onSelectRow` function returns null. Fixes STSMACOM-49.
* Introduce `<ConfigManager>` component. Fixes STSMACOM-51.
* UIIN-58's show-single-result feature should be optional and default to false. Refs UIREQ-60, UICHKOUT-54, UIU-373; fixes STSMACOM-52.
* Appease eslint-config-stripes. Fixes STSMACOM-56.
* Support `searchableIndexesPlaceholder` property. Fixes STSMACOM-62.
* Update `<SearchAndSort>` documentation for eight new properties. Fixes STSMACOM-63.
* Autocomplete @mentioned usernames in notes. STSMACOM-4. Available from v1.4.1.
* Happy lint, happy life. Refs STSMACOM-56. Available from v1.4.2.
* Optionally derive some `<SearchAndSort>` params from props.packageInfo. Refs STSMACOM-64. Available from v1.4.3.
* Always derive some `<SearchAndSort>` params `props.packageInfo`. Refs STSMACOM-64. Available from v1.4.4.
* Optionally prevent `<SearchAndSort>` from showing create or edit panes. Refs UIPFU-6. Available from v1.4.5.
* Provide HTML-id for `<ConfigManager>` save button for easy access by tests. Refs UITEST-20. Available from v1.4.6.
* In `<SearchAndSort>`, all references to `parentProps` (except in app-specific sub-components) are via a `ResourcesAnalyzer` object. Fixes STSMACOM-65.
* Do not destroy `<ConfigForm>` on unmount. Refs UIORG-53. Available from v1.4.6.
* Change `ResourcesAnalyzer` API so that constructor takes top-level props. Fixes STSMACOM-68.
* Switch `ResourcesAnalyzer` API to use a factory method. Fixes STSMACOM-69.
* Add optional `apolloResource` property to `<SearchAndSort>`, for use of resource analyzer. Fixes STSMACOM-70.
* Allow `<ConfigManager>` to massage form values before save. Fixes STSMACOM-71.
* Internationalize `<EntryManager>`. Fixes STSMACOM-76, STSMACOM-78.
* Added functionality to `<ControlledVocab>` to render updated metadata, usage counts and confirm deletion requests. Refs STCOM-228.
* Added `<UserName>` and `<UserLink>` components to render names/links based on FOLIO User IDs. Refs STCOM-228.
* Extend ResourcesAnalyzer to work for GraphQL-provided resources. Mutations not yet supported. Fixes STSMACOM-66.
* Extract proxy modal into `<ProxyManager>`. Fixes STSMACOM-58.
* Ignore `yarn-error.log` file. Refs STRIPES-517.
* Guarantee `stripes` object is available to new-record components. Fixes STSMACOM-75. Available from v1.4.8.
* Introduced a new `<LocationLookup>` component. Fixes STSMACOM-79. Available from v1.4.9.
* Introduced a new `<LocationSelection>` component. Fixes STSMACOM-82. Available from v1.4.10.
* Added a more user friendly empty message to the results list.
* Improve search field in `<SearchAndSort>` component. Fixes STSMACOM-81.
* Guard against selecting new-record row when no mutations available. Fixes STSMACOM-83. Available from v1.4.11.
* Move `<ViewMetaData>` to stripes-smart-components. Fixes STSMACOM-84.
* `<ControlledVocab>` rows may be filtered. Refs UIORG-61, UIORG-65. Available from v1.4.12.
* Enable correct error-handling when using GraphQL. Fixes STSMACOM-74.
* Enhance `<SearchAndSort>` to handle GraphQL responses. Fixes STSMACOM-59.
* Add support for inactive location confirmation. Refs UIIN-121, STSMACOM-85.
* `<NoResultsMessage>` now uses the new resources-analyzer method `failureMessage` when reporting errors. Fixes STSMACOM-88.
* Placeholder comment about `notifyOnNetworkStatusChange`. Interim fix for STSMACOM-89.
* Move the GraphQL pagination code into the ResourcesAnalyzer. Fixes STSMACOM-90.
* Move the stripes-connect pagination code into the ResourcesAnalyzer. Fixes STSMACOM-91.
* Rename ResourcesAnalyzer to ConnectedSource. Fixes STSMACOM-95.
* Break ConnectedSource into multiple source files. Fixes STSMACOM-97.
* Support paging in `<SearchAndSort>`'s use of GraphQL. Fixes STSMACOM-72.
* Always display sole hit when narrowing down to one result. Fixes STSMACOM-98.
* Adjust buttons on `<LocationLookup>` popup. Fixes STSMACOM-96.
* `<ProxyManager>` now obeys "user cannot request for sponsor" setting. Fixes STSMACOM-101.
* Fix autoprefixer console warning about `stretch`. Fixes STSMACOM-102.
* Relocate translation files per STCOR-211. Fixes STSMACOM-104.
* Added to `<ControlledVocab>` a `readOnlyFields` prop. Refs UIIN-150, UIIN-151, UIIN-152.
* `<ControlledVocab>` now (by default) suppresses edit/delete actions on records that have a truthy `readOnly` prop. Fixes STSMACOM-103.
* Use `<LocationSelection>` component in location lookup popup. Fixes STSMACOM-94.
* CSS magic to avoid truncated names in `<ControlledVocab>`. Fixes STSMACOM-99.
* Update `<ProxyManager>` to the new proxy structure. Fixes STSMACOM-105.
* `<UserLink>` only renders a link if user has permission to follow it. Fixes STSMACOM-106, refs UIORG-76.
* Added `<ChangeDueDateDialog>` component and its child components. Refs UIU-497.
* Added `<LoanList>` component. Refs UIU-497.
* Update path to stripes-components previously nested within lib/structures. Refs STCOM-277.
* `<ControlledVocab>` will optionally hide its list and display a reason why. Refs UIORG-83.
* Turn off enforceFocus on `<LocationModal>`. Fixes STSMACOM-109.
* Add extra check to `<EntryManager>` to recognize add/edit mode. Fixes STSMACOM-110.
* Display translated module title, not translation key, in `<SearchAndSort>`. Fixes STSMACOM-111.
* Allow for choosing empty value in `<LocationSelection>` and `<LocationLookup>`. Refs UIIN-198.
* Increase default location-limit in `<LocationModal>`. Available from v1.4.18.
* Cache user object metadata in `<ControlledVocab>`; it's faster. Fixes STCOM-308.
* Refactor `<EntryManager>` to support anointed resource. Fixes STCOR-231.
* Retrieve more locations via `<LocationSelection>`. Refs UIORG-91.
* Provide an id prop to `<ConfirmationModal>` to avoid it autogenerating one for us. Refs STCOM-317. Available from v1.4.23.
* Initial support for tags on individual records. Toward STSMACOM-113, FOLIO-1303. Available from v1.4.24.
* Update version of @folio/react-intl-safe-html. Fixes STRIPES-545.
* Add custom field validation for `<ControlledVocab>`. Fixes STSMACOM-114.
* Check for `<ControlledVocab>` errors more carefully. Refs STSMACOM-114. Available from v1.4.26.
* Cleaner handling of result-count header. Refs STSMACOM-108. Available from v1.4.27.
* Lock react-bootstrap to v0.32.1 to avoid buggy babel-runtime 7.0.0-beta.42 dep. Refs FOLIO-1425. Available from v1.4.28.
* New optional `notLoadedMessage` prop for `<SearchAndSort>`. Fixes STSMACOM-116. Available from v1.4.29.
* Fix initial query string to keep searchField updated. Fixes STSMACOM-119.
* Wait until settings load before rendering the form. Refs UICIRC-75. Available from v1.4.32.
* Added `<PasswordStrength>` component with EN translations. Refs UIU-516.
* Added "tai-password-strength" to `package.json` for PasswordStrength. Refs UIU-516.

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
