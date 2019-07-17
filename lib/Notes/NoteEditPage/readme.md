## NoteEditPage
A connected component for editing a note

## Description
This is a connected component used for editing a note. It's responsible for fetching note data, note types, validating the data entered by user, sending it to the back-end (mod-notes), handling navigation/redirection after a note is created or chancel button is clicked.

## Props
|         Name           |            Type             |                    Description                        |
| ---------------------- | --------------------------- | ----------------------------------------------------- |
| noteId     | string | Is used for fetching note data |
| referredEntityData     | object with `name`, `type` and `id` strings | Is used for displaying the data of an entity from whose page a user navigated to the create note page. The newly created note will be attached to this entity |
| domain | string | Every note is associated with a domain (i.e application). This prop tells which domain the newly created note should be associated with |
| paneHeaderAppIcon | string | A name of an icon to be displayed in the pane header |
| navigateBack | func | A callback which is executed after the note is successfully saved or when cancellation button is clicked |
| entityTypesTranslationKeys | object whose keys are entity types and values are the translation keys for those entity types | is used to translate `referredEntityData`'s entity type |
| entityTypePluralizedTranslationKeys | object whose keys are entity types and values are the translation keys for those entity types | is used to translate linked records' entity types |
