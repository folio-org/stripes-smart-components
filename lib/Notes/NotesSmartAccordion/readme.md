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
  entityType="package"
  entityId="350-1207861"
  onCreate={redirectToNoteCreatePage}
  onAssignedNoteClick={redirectToNoteDetailsPage}
 />
```

### Properties

Name | type | description
--- | --- | ---
domainName | string | App name.
entityType | string | Record name(e.g. package).
entityId | string | Record id.
onCreate | function | Callback to be called after click on "New" button. Basically, intended for redirecting to Note create page.
onAssignedNoteClick | function | Callback to be called after click on assigned note, located inside accordion's list. Gets Note id as argument. 