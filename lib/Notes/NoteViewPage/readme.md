## NoteCreatePage
A connected component for viewing a note

## Description
This is a connected component used for:
1) viewing a note.
2) unassigning a note
3) deleting a note


## Props
|         Name           |            Type             |                    Description                        |
| ---------------------- | --------------------------- | ----------------------------------------------------- |
| referredEntityData     | object with `name`, `type` and `id` strings | Is used for displaying the data of an entity from whose page a user navigated to the create note page. The newly created note will be attached to this entity |
| paneHeaderAppIcon | string | A name of an icon to be displayed in the pane header |
| navigateBack | func | A callback which is executed after the note is successfully saved or when cancellation button is clicked |
| entityTypeTranslationKeys | object whose keys are entity types and values are the translation keys for those entity types | is used to translate `referredEntityData`'s entity type |
| entityTypePluralizedTranslationKeys | object whose keys are entity types and values are the translation keys for those entity types | is used to translate the entity types for which the note is linked |
| onEdit | func | A callback which is naqvigate to the  note edit page  |
| onEdit | string | Id of the note to fetch  |
