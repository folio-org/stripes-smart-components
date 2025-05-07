# NotesSmartAccordion

Is a component that integrates with other apps for providing assign/unassign functionality and view Note assignments.

## Description

Is a part of notes smart components set allows users to participate in running commentary on records. Contains two parts: accordion for displaying assigned notes and modal window to search domain notes and assign/unassign them from record.

### Usage

import
```js
import { NotesSmartAccordion } from '@folio/stripes/smart-components';
```

Use the `NotesSmartAccordion` component in your jsx
```js
<NotesSmartAccordion
  domainName="eholdings"
  entityName="A Biographical Dictionary of Later Han"
  entityType="package"
  entityId="350-1207861"
  pathToNoteCreate="/eholdings/notes/new"
  pathToNoteDetails="/eholdings/notes"
 />
```

### Properties

Name | type | description
--- | --- | ---
domainName | string | App name.
entityName | string | The title of the record name(e.g. A Biographical Dictionary of Later Han).
entityType | string | Record name(e.g. package).
entityId | string | Record id.
hideEditButton | bool   | Hides the edit button. Default is false.
interactive | bool   | Applies a "pointer" cursor when the mouse hovers over a row. Default is true.
noRowClick | bool   | Prevents clicking on a row. Default is false.
pathToNoteCreate | string | Path to Note create page.
pathToNoteDetails | string | Path to Note details page. NotesSmartAccordion will add / with note id during redirecting to details page. 
