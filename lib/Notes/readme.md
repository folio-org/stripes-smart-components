# Notes

A suite of connected components for creating, editing, viewing, and displaying pop-up notes attached to any FOLIO record.

## Components

| Component | Purpose |
|---|---|
| `NoteCreatePage` | Full-page form for creating a note and assigning it to a record |
| `NoteEditPage` | Full-page form for editing an existing note |
| `NoteViewPage` | Read-only full-page view of a note |
| `NotesSmartAccordion` | Accordion that lists notes assigned to a record, with assign/create actions |
| `NotePopupModal` | Modal that auto-shows pop-up notes when a record is opened |

---

## NotePopupModal

Automatically fetches and displays notes flagged for pop-up display when a record is opened. Multiple notes are shown sequentially — closing one advances to the next.

### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `domainName` | `string` | ✓ | — | Okapi notes domain (e.g. `"users"`) |
| `entityType` | `string` | ✓ | — | Entity type (e.g. `"user"`) |
| `entityId` | `string` | | `''` | ID of the record being viewed. Changing this triggers a fresh fetch. |
| `popUpPropertyName` | `string` | ✓ | — | Note field used as the pop-up flag (e.g. `"popUpOnUser"`, `"popUpOnCheckOut"`) |
| `preventDuplicates` | `bool` | | `false` | When `true`, the popup is shown only once per entity per page session. Re-shows after the pane is explicitly closed. See [Duplicate suppression](#duplicate-suppression). |
| `label` | `node` | | i18n default | Modal header label |
| `closeLabel` | `node\|string` | | i18n default | Close button label |
| `deleteLabel` | `node\|string` | | i18n default | Delete button label |

### Duplicate suppression

By default (`preventDuplicates={false}`) the popup fires every time the component mounts with a new `entityId` — the original behaviour, preserved for backwards compatibility.

Pass `preventDuplicates` to opt into session-scoped deduplication:

```jsx
<NotePopupModal
  domainName="users"
  entityType="user"
  entityId={user.id}
  popUpPropertyName="popUpOnUser"
  preventDuplicates
/>
```

With `preventDuplicates`:

- The popup fires **once** per entity per `popUpPropertyName` per page session.
- Navigating away (edit form, note creation, another app) and returning to the **same** record does **not** re-show the popup.
- A **page reload** resets all tracking — the popup re-shows on the next visit.
- Explicitly **closing the detail pane** re-enables the popup for the next open.

Tracking is keyed by `popUpPropertyName`, so different app contexts (e.g. Users and Check out) are fully independent.

### `resetNotePopupTracking(popUpPropertyName)`

Call this whenever the record detail pane is explicitly closed so the popup re-shows the next time the same record is opened. Only relevant when `preventDuplicates` is in use.

```js
import { resetNotePopupTracking } from '@folio/stripes/smart-components';

resetNotePopupTracking('popUpOnUser');
```

Pass no argument to clear tracking for all `popUpPropertyName` keys at once.

---

## NoteCreatePage

Full-page form (wrapped with `stripesConnect`) for creating a new note and assigning it to a record.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `domain` | `string` | ✓ | Okapi notes domain |
| `navigateBack` | `func` | ✓ | Called on save or cancel |
| `paneHeaderAppIcon` | `string` | ✓ | App icon name for the pane header |
| `paneTitle` | `node` | | Pane title |
| `renderReferredRecord` | `func` | | Renders the associated record summary in the form |
| `showDisplayAsPopupOptions` | `bool` | | Shows "Display as pop-up" checkboxes in the form |
| `entityTypeTranslationKeys` | `objectOf(string)` | | Maps entity types to i18n keys for display |

---

## NoteEditPage

Full-page form for editing an existing note.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `domain` | `string` | ✓ | Okapi notes domain |
| `noteId` | `string` | ✓ | ID of the note to edit |
| `navigateBack` | `func` | ✓ | Called on save or cancel |
| `paneHeaderAppIcon` | `string` | ✓ | App icon name for the pane header |
| `referredEntityData` | `object\|bool` | | Data for the associated record |
| `renderReferredRecord` | `func` | | Renders the associated record summary |
| `showDisplayAsPopupOptions` | `bool` | | Shows "Display as pop-up" checkboxes |
| `entityTypeTranslationKeys` | `objectOf(string)` | | Maps entity types to i18n keys |
| `entityTypePluralizedTranslationKeys` | `objectOf(string)` | | Pluralised form of the above |

---

## NoteViewPage

Read-only view of a single note.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `noteId` | `string` | ✓ | ID of the note to display |
| `navigateBack` | `func` | ✓ | Called on back/cancel |
| `onEdit` | `func` | ✓ | Called when the Edit button is clicked |
| `paneHeaderAppIcon` | `string` | ✓ | App icon name for the pane header |
| `referredEntityData` | `object\|bool` | | Data for the associated record |
| `renderReferredRecord` | `func` | | Renders the associated record summary |
| `entityTypeTranslationKeys` | `objectOf(string)` | | Maps entity types to i18n keys |
| `entityTypePluralizedTranslationKeys` | `objectOf(string)` | | Pluralised form of the above |

---

## NotesSmartAccordion

Accordion that lists notes assigned to a record and provides actions to assign existing notes or create new ones.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `domainName` | `string` | ✓ | Okapi notes domain |
| `entityId` | `string` | ✓ | ID of the record |
| `entityType` | `string` | ✓ | Entity type |
| `history` | `object` | ✓ | React Router history |
| `label` | `node\|string` | | Accordion label |
| `id` | `string\|number` | | Accordion ID |
| `open` | `bool` | | Controlled open state |
| `onToggle` | `func` | | Toggle callback |
| `pathToNoteCreate` | `string` | | Route for note creation |
| `pathToNoteDetails` | `string` | | Route for note detail view |
| `referredRecordData` | `object` | | Passed to note create/edit forms |
| `hideNewButton` | `bool` | | Hides the "New" button |
| `hideAssignButton` | `bool` | | Hides the "Assign" button |
| `hideEditButton` | `bool` | | Hides per-note edit buttons |
| `interactive` | `bool` | | Makes note rows clickable |
| `canClickRow` | `bool` | | Enables row-click navigation |
