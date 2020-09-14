# Change history for stripes-smart-components

## 5.0.0 (IN PROGRESS)

* Fixing tests to use initalState rather than back-end calls for module data.
* Added code to check results of saving tag data and show appropriate toast.  Refs STSMACOM-401.
* Increment `react-router` to `^5.2`. Refs STRIPES-674.
* Add alphabetical sorting of Custom Field options. Refs STSMACOM-379.
* Add changeable content to assigned accordion to NotesView and NotesForm components. Part of UIREQ-467.
* Settings > Edit Custom Fields > change Save button label to Save & close. STSMACOM-380.
* Prevent PUT request for accordion title during drag'n'drop custom field. STSMACOM-382.
* Fix incorrect `Last updated source` in Note View metadata when record was never updated. Fixes STSMACOM-386.
* Add `entityTagsPath` to `Tags` to set custom entity tags path. Refs STSMACOM-385.
* Increase record limit for loan policy lookups in `<ChangeDueDateDialog>`. Fixes UIU-1731.
* Remove horizontal scrollbar from `ChangeDueDateDialog`. Refs STSMACOM-402.
* Use search term when filter is applied via `<SearchAndSort>`. Fixes STSMACOM-365.
* Remove Note details length limit. Refs STSMACOM-383.
* Added `headingLevel` for `<ViewMetaData>`-component. Refs STSMACOM-400.
* Fix reset the sort terms when clicking the 'Reset all' button. Fixes STSMACOM-194.
* Extended Note title max length to 255. Refs STSMACOM-335.
* Show Note details in Notes Accordion. Refs STSMACOM-353.
* Set record limit for libraries in `<LocationLookup>`. Fixes UIOR-591.
* Increase record limit for open request lookups in `<ChangeDueDateDialog>`. Fixes STSMACOM-404.
* Use search term when filter is applied via `<SearchAndSortQuery>`. Fixes STSMACOM-407.
* Remove 'no data' message displayed when saving the item. Fixes STSMACOM-384.
* Fix Custom Fields multiselect Label field not read as required. Fixes STSMACOM-363.
* Make Notes list column headings sortable. Refs STSMACOM-328.
* Refactor from `bigtest/mirage` to `miragejs`.
* Fix Custom Fields Edit page has multiple elements with the same ID. Fixes STSMACOM-410.
* Add `listFormLabel` prop to `ControlledVocab` to set header of `EditableList`. Refs STSMACOM-408.
* Show correct number of characters in NoteList details. Refs STSMACOM-411.
* Handle `react-router-dom` deprecation warnings. Refs STSMACOM-421.
* Handle 'Aged to lost' items in `<ChangeDueDateDialog>`. Refs UIU-1495.
* Fixed `Show more` button in `<NotesList>` expanding every note. Refs STSMACOM-419.
* Fix bug in `<ChangeDueDateDialog>` that saved an unwanted actionComment. Fixes STSMACOM-432.
* Increment `react-intl` to `v5`. Refs STSMACOM-433.

## [4.2.0] (IN PROGRESS)

* Loan Details > Successfully change due date is not read by a screenreader AND also there is a keyboard trap. Refs STSMACOM-376.
* Loan Details > Change due date| Error message is not read by screenreader Refs STSMACOM-375.
* Edit/View Custom Fields UI updates. Refs STSMACOM-355.
* Allow a user to not select any option in a single select custom field Refs UIU-1673.
* Removing aria-labelledby attribute from primary address radio button.  Fixes UIU-1641
* Remove asterisk from radio button custom field label. Fixes UIU-1700
* Apply correct styling to the save button on the edit custom fields page. Fixes STSMACOM-368
* Make checkbox custom field correctly reflect form state. Fixes UIU-1690
* Allow loading more than 10 Custom Fields. Refs STSMACOM-370.
* Fix bug with drag and drop for radio button group. Refs STSMACOM-367.
* Fix cannot select a radio button when multiple Custom Field radio button sets are created. Refs STSMACOM-373.
* Display custom fields accordion with a spinner while custom fields data is being loaded.
* Add `label` prop to `<NotesSmartAccordion>` and `createFormTitle` for `<NoteForm>`. Part of UIREQ-457.
* Introduce `basePath` prop to add ability to control the path after search is performed. Part of STSMACOM-378.

## [4.1.1](https://github.com/folio-org/stripes-smart-components/tree/v4.1.1) (2020-07-12)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v4.1.0...v4.1.1)

* Add new unsaved Custom Fields to accordions state. Fixes STSMACOM-352.
* Support unique ID for custom fields, required by changes to the response shape. Refs STSMACOM-339.

## [4.1.0](https://github.com/folio-org/stripes-smart-components/tree/v4.1.0) (2020-06-08)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v4.0.0...v4.1.0)

* `<Notes>` `onToggle` prop is optional.
* Correctly show custom fields' `<MultiSelect>` validation message.
* Vastly increase custom fields test coverage. Refs STSMACOM-331.
* Correctly prefix translation keys in `<IntlHarness>` so l10n in tests actually works!
* `<Settings>` supports new optional `additionalRoutes` property, an array of `<Route>` objects that are included in the `<Settings>` component's routing for its sub-pane, but which are not displayed in the visible list of settings sections.
* Use `UNSAFE_` prefix for deprecated React methods. We know, we know. Refs STSMACOM-324.
* Handle 'claimed returned' items in `<ChangeDueDate>`. Refs UIU-1260.
* Sort custom fields' input types. Refs STSMACOM-394.

## [4.0.0](https://github.com/folio-org/stripes-smart-components/tree/v4.0.0) (2020-05-20)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v3.1.0...v4.0.0)

* Increment `react-intl` to `v4.5`. Refs STRIPES-672.
* Do not use translations from `ui-circulation`; that module may not be present.
* Test clean-up etc related to the babel-7 upgrade. Refs STCOR-381.

## 3.2.0 (UNRELEASED)

* Custom fields: create page accordions for create/edit/view record. UIU-1279.
* Custom fields: apply checkbox vertical alignment. Refs UIU-1527.
* Add optional prop `hasNewButton` to `SearchAndSort` component. Refs UIREQ-415.
* Modify change due date dialog behavior to report successes and failures. Refs UIU-1516.
* Support custom `getEntity` and `getEntityTags` methods in `Tags` component (UIDATIMP-461)
* Check if the component exists for `customField.type` before rendering. Fixes STSMACOM-333.
* Change `redirectToView`, `redirectToEdit` props in CustomFields to `viewRoute` and `editRoute`. Refs UIU-1594.
* Add support for `SINGLE_SELECT_DROPDOWN` Custom Field in User View/Edit/Create. Refs UIU-1565.
* Prevent `ProxyManager` form submission from propagating to outer forms. Fixes UIREQ-449, UIREQ-454.
* Marked Note Title field as required. Fixes STSMACOM-323.
* Added `PersistedPaneset` component.
* Pin `moment` at `~2.24.0`. Refs STRIPES-678.
* Custom fields: Single select dropdown. Refs STSMACOM-285.
* Custom fields: Multi-select dropdown. Refs STSMACOM-326.
* Custom fields: Radio button set. Refs STSMACOM-292.
* Entry Manager: hide Edit button when actions menu is enabled. Refs UICIRC-437.
* Custom fields: support redux-form and final-form.
* Add support for `MULTI_SELECT` Custom Field in User View/Edit/Create. Refs UIU-1569.
* Add drag and drop support for Custom Fields. Refs STSMACOM-267.

## [3.1.0](https://github.com/folio-org/stripes-smart-components/tree/v3.1.0) (2020-03-16)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v3.0.0...v3.1.0)

* Notes: relocate expand-all accordion label. Refs STSMACOM-313.
* Custom fields: provide `checkbox` input type. Refs STSMACOM-314.
* Custom fields: allow change to accordion label. Refs STSMACOM-275.
* Handle tags with special characters. Refs STSMACOM-257 STSMACOM-294.
* Custom fields: accept required permissions props. Refs UIU-1492.

## [3.0.0](https://github.com/folio-org/stripes-smart-components/tree/v3.0.0) (2020-03-04)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.12.0...v3.0.0)

* Keep search term around after browser refresh. Fixes STSMACOM-271.
* Added integration point for `resultOffset`, which supports `stripes-components` result list "load more" button. Refs STCON-57.
* Reset `resultCount` and `resultOffset` when sorting. Fixes STSMACOM-269.
* `<EditableList>`: Disable the actions in existing rows when another item is being created or edited. Refs STCOM-624.
* Improve accessibility, add attribute `aria-label` to `nav` tag in Settings. Refs UICAL-85.
* Bump `<ControlledVocab>` fetch limit to 2000. Refs STSMACOM-296.
* Increase of character limit for notes to 3500. Refs STSMACOM-295.
* Added support for periods in filter values.
* Escape quotes and backslashes in the values inserted into CQL queries. Refs UIIN-589.
* Display `effective call number prefix`, `call number`, `call number suffix`, `enumeration`, `chronology`, `volume` in loans contexts. Refs UIU-1391.
* Handle (i.e., reject) 'declared lost' items in `<ChangeDueDateDialog>`. Refs UIU-1207.
* Create UI permissions for Custom Fields. Refs UIU-1492

## [2.12.0](https://github.com/folio-org/stripes-smart-components/tree/v2.12.0) (2019-12-04)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.11.0...v2.12.0)

* Update `locallyChangedSearchTerm` only when query from resourceQuery matches query param from URL. Refs UUIN-758.
* Retrieve up to 100k of requested user loans instead of 10 in change due date dialog. Refs UIU-1293.
* Show notes in alphabetical order. Refs UINOTES-59.
* Show "unknown count" message instead of "999,999,999". Refs STSMACOM-259.
* `<SearchAndSort>` should accept a function to determine some routes. Refs STSMACOM-251.
* Add `<Spinner>` to `<ChangeDueDateDialog>` while loans are loading. Refs UIU-1379.
* Better error display for `<EditableList>`. Refs STSMACOM-264.
* Notes form refactor. Refs STSMACOM-270.

## [2.11.0](https://github.com/folio-org/stripes-smart-components/tree/v2.11.0) (2019-09-25)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.10.0...v2.11.0)

* Better handling of server errors in `<ControlledVocab>`. STSMACOM-227.

## [2.10.0](https://github.com/folio-org/stripes-smart-components/tree/v2.10.0) (2019-09-09)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.9.0...v2.10.0)

* Pluralize notes translation string. Refs STSMACOM-241.
* Prevent multiple clicks on `<ControlledVocab>`'s `New` button. STCOM-539
* Centralize `<Notes>` tests instead of distributing them across all implementing apps. Refs STSMACOM-241.
* Move expand/collapse filter-pane button into the filter-pane itself. STSMACOM-233
* Pass correct prop to `<AddressFieldGroup>` translation.
* Suppress Okapi error related to reference constraint violations. ERM-390
* Allow suppression of sort for some column headers. Refs UIOR-292
* Use `rowUpdater` prop for `MultiColumnList` in `EditableList, ControlledVocab, ChangeDueDateDialog`. Refs STCOM-363
* Update interactor for `Notes Accordion`. Refs STCOM-363

## [2.9.0](https://github.com/folio-org/stripes-smart-components/tree/v2.9.0) (2019-08-21)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.8.0...v2.9.0)

* Retain search query when returning to search and sort app. Part of STSMACOM-232.
* Reset results when search field is cleared out manually. Fixes STCOM-549.
* Add possibility to hide assign button on notes accordion. Refs STSMACOM-236.
* Filter `<Note>`s by type. Refs STSMACOM-237.
* Clearer language throughout `<Note>` modals. Refs STSMACOM-338, STSMACOM-239, STSMACOM-240.
* Bump react-final-form version to 6, consistent with other modules.
* Hide new-record route and button when there is no permission to use it. Refs UIORGS-79.
* Correctly describe `<EntryManager>`'s PropTypes to avoid erroneous console warnings.
* `<EditableList>`: Disable New button when editing row. Refs STCOM-539.

## [2.8.0](https://github.com/folio-org/stripes-smart-components/tree/v2.8.0) (2019-07-24)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.7.2...v2.8.0)

* `<SearchAndSort>` accepts `title` to set the results-pane headline. Refs UIOR-298.
* `<EditableList>` layout is stable when validation errors are present and prevents validation on cancel. Fixes UIORG-81.
* `<ControlledVocab>` accepts optional new `actuatorType` property. If set to `'refdata'`, it performs different back-end operations to maintain the vocabulary, as described in [_API to the Refdata system_](https://github.com/openlibraryenvironment/ui-directory/blob/master/doc/refdata-api.md). Fixes [ReShare issue PR-189](https://openlibraryenvironment.atlassian.net/browse/PR-189). Available from v2.7.3.
* Remove permissions related to the (deprecated and removed) earlier implementation of Notes (STSMACOM-224)
* `<ControlledVocab>` displays error message when save fails. Fixes STSMACOM-165.
* `<AddressFieldGroup>` i18n. Fixes STSMACOM-170.
* Reset `<SearchField>` with an empty string instead of undefined. Fixes UIIN-615.
* Fix requests count and alert message after loan due date changed. Refs UIU-1070.
* Pass `permissions` to `setupApplication` so tests can configure their own permissions. Fixes STSMACOM-231.
* Fix `<ViewMetaData>` so it doesn't blow the stack when creator and updater differ. Fixes STSMACOM-230.

## [2.7.2](https://github.com/folio-org/stripes-smart-components/tree/v2.7.2) (2019-06-11)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.7.1...v2.7.2)

* Fix `<ChangeDueDateDialog>` flickering during due date change. Refs UIU-1065.

## [2.7.1](https://github.com/folio-org/stripes-smart-components/tree/v2.7.1) (2019-06-10)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.7.0...v2.7.1)

* `<Notes/NotesSmartAccordion>` now includes permissions check. Refs STSMACOM-223.

## [2.7.0](https://github.com/folio-org/stripes-smart-components/tree/v2.7.0) (2019-06-07)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.6.3...v2.7.0)

* Lots of  `<Notes>` work. Refs STSMACOM-195, STSMACOM-196.
* add `renderNavigation` prop to `<SearchAndSort>`. Refs UIOR-27.
* better test instrumentation for `<ControlledVocab>`. Refs UIORG-163.
* add `parseRow` prop to `<ControlledVocab>` to store complex values. Refs UINV-6.
* stripes-form v2.6.0
* Allow for passing queryTemplate as a function to makeQueryFunction. Refs UIU-1068.

## [2.6.3](https://github.com/folio-org/stripes-smart-components/tree/v2.6.3) (2019-05-10)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.6.2...v2.6.3)

* stripes-form v2.5.0

## [2.6.2](https://github.com/folio-org/stripes-smart-components/tree/v2.6.2) (2019-05-10)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.5.0...v2.6.2)

* Case-insensitive location sort. Fixes STSMACOM-192.
* Accept `props.onCloseNewRecord` so clients can do what they choose. Refs UIREQ-244.
* Pass `clientGeneratePk` prop into manifest option, supporting server-side modules that supply IDs of new records.
* `<ControlledVocab>` accepts optional `limitParam` prop, for when that parameter is not called `limit`.
* Create `NoteForm` component

## [2.5.0](https://github.com/folio-org/stripes-smart-components/tree/v2.5.0) (2019-04-25)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.4.0...v2.5.0)

* Turned off sideEffects to enable tree-shaking for production builds. Refs STRIPES-564 and STRIPES-581.
* Improve display handling of `<ControlledVocab>` metadata. Refs STSMACOM-181, STSMACOM-182, STSMACOM-183, UIU-873, UIIN-462.
* Refactor `<ViewMetaData>` a la `<ControlledVocab>` to avoid permissions problems and simplify, simplify.

## [2.4.0](https://github.com/folio-org/stripes-smart-components/tree/v2.4.0) (2019-04-14)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.3.0...v2.4.0)

* Add `<SearchAndSortQuery>` component - a composable building block for search and sort patterns. [See Readme](https://github.com/folio-org/stripes-smart-components/lib/SearchAndSort/SearchAndSortQuery.md). Completes STSMACOM-179.
* Increase location fetch limit. Refs STSMACOM-180.
* Provide IDs for `<EntrySelector>`'s action menu buttons.

## [2.3.0](https://github.com/folio-org/stripes-smart-components/tree/v2.3.0) (2019-03-28)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.2.0...v2.3.0)

* Increment `stripes-core` to v3.3.0, and `stripes-form` to v2.3.0, including React 16.8.

## [2.2.0](https://github.com/folio-org/stripes-smart-components/tree/v2.2.0) (2019-03-22)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.1.0...v2.2.0)

* Increment `stripes-connect` to v5.0.0, `stripes-core` to v3.2.0, and `stripes-form` to v2.2.0.

## [2.1.0](https://github.com/folio-org/stripes-smart-components/tree/v2.1.0) (2019-03-14)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.0.1...v2.1.0)

* Export more SearchAndSort building blocks for use in other projects. Refs UIDATIMP-47.
* Update ARIA-roles in SearchAndSort and EditableList. Fix for STCOM-365
* Add "remove" to `EntryManager`'s action menu. Refs UICIRC-108.
* Add confirmation modal when removing entries via action menu. Refs UICIRC-109.
* Use columns' static labels, not their translated aliases, for sorting in `<SearchAndSort>`. Fixes STSMACOM-93.
* Restore predictable `id` attributes to checkboxes created by `<CheckboxFilter>`. Refs UISE-97.
* Extract static strings for translation. Fixes STSMACOM-169, STSMACOM-175.
* Only clear resource query when SearchAndSort runs in a plugin mode. Refs ERM-72.
* Modify `ViewMetaData` component to render system user (UIDATIMP-156)
* Update user data when props changed in `ViewMetaData` component. Fix for STSMACOM-177

## [2.0.2](https://github.com/folio-org/stripes-smart-components/tree/v2.0.2) (2019-03-13)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.0.1...v2.0.2)
’’
* Make stripes dependencies more strict with ~ instead of ^. Refs STRIPES-608.

## [2.0.1](https://github.com/folio-org/stripes-smart-components/tree/v2.0.1) (2019-01-17)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v2.0.0...v2.0.1)

* Require `stripes-connect` `4.x` and `stripes-form` `2.x`

## [2.0.0](https://github.com/folio-org/stripes-smart-components/tree/v2.0.0) (2019-01-16)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.12.0...v2.0.0)

* Lenient label proptypes accept a node in order to receive a `<FormattedMessage>`. Available from v1.12.1.
* Provide `contentLabel` to `<Layer>` from `<EntryManager>`. Available from v1.12.2.
* Refactor proxy fetching in `<ProxyManager>`. Fixes STSMACOM-154. Available from v1.12.3.
* Fix no results found message. Fixes STSMACOM-155.
* Remove `noOverflow` from `<EntrySelector>` list pane. Ref UIU-764.
* Label `<UserLink>` as deprecated. Refs STRIPES-577.
* Narrow use of `<LoanList>`
* Remove `<Notes>`
* Remove `<UserLink>`

## [1.12.0](https://github.com/folio-org/stripes-smart-components/tree/v1.12.0) (2018-11-29)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.11.0...v1.12.0)

* Add stopPropagation to search from. Refs UIU-731.
* Reset query resource to initial values on unmount. Refs UIU-733.
* Move `<EntrySelector>` from `stripes-components`
* Removed deprecated actionMenuItems-prop. Fixes STSMACOM-147.

## [1.11.0](https://github.com/folio-org/stripes-smart-components/tree/v1.11.0) (2018-11-19)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.10.0...v1.11.0)

* Add clone option to `EntryManager`. Fixes STSMACOM-134.
* Add ability to pass custom add menu component to `EntryManager`. Fixes STSMACOM-136.
* Use react-intl directly instead of stripes.intl
* Enable tags by default. Part of UITAG-8.
* Add parseInitialValues to entry wrapper. Fixes STSMACOM-137.
* `ControlledVocab` accepts `sortby` to override its default ordering. Refs MODUSERS-98, fixes STSMACOM-139. Available from v1.10.1.
* Show details view of the newly created record after duplication. Fixes STSMACOM-140.
* Open details screen after new record is created. Fixes STSMACOM-141.
* Internalize logic of `<UserLink>` into `<ControlledVocab>` for efficiency. Fixes STSMACOM-142. Available from v1.10.2.
* Remove `<Paneset>` from `<Settings>`
* Clear query resource on `SearchAndSort` component unmount. Fixes STSMACOM-146.
* Replace `formatMessage()` with `<FormattedMessage>` in `<SearchAndSort>`
* Use create-new-button attributes consistently.
* Validate callouts before calling them.
* Consistent id attributes for `<EntryManager>` buttons.

## [1.10.0](https://github.com/folio-org/stripes-smart-components/tree/v1.10.0)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.9.0...v1.10.0)
(2018-10-04)
* Switched css variables to use kebab-case.
* Copy `craftLayerUrl()` into `<SearchAndSort>`.
* Export `LocationSelection` and `makeQueryFunction`.

## [1.9.0](https://github.com/folio-org/stripes-smart-components/tree/v1.9.0) (2018-10-02)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.8.3...v1.9.0)

* Introduce `getHelperResourcePath` prop. Fixes STSMACOM-131.
* Remove notes helper app from `<SearchAndSort>`
* Move `stripes-form` to dependencies

## [1.8.3](https://github.com/folio-org/stripes-smart-components/tree/v1.8.3) (2018-09-19)
[Full Changelog](https://github.com/folio-org/stripes-smart-components/compare/v1.8.0...v1.8.3)

* Fix tags autosuggest subsort. Fixes STSMACOM-123.
* Updated localized string "searchResultsCountHeader" to use sentence casing. (STCOM-339)
* Update `stripes-form` dependency to v1.0.0
* Move stripes-core to `peerDependencies`. Part of STRIPES-557.

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
