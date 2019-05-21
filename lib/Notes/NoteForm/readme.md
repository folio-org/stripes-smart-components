# NoteForm
A component for creating/editing a note

## Description
Different applications may want to have an ability to create/edit notes and attach them to their entities. `<NoteForm />`
is a reusable dumb component which apps can use for editing and creating a note. It provides the whole layout for create and edit note pages, including all needed panes, accordions, fields, buttons and the form itself.

## Props 
The following props are supported:

|         Name           |            Type             |                    Description                        |
| ---------------------- | --------------------------- | ----------------------------------------------------- |
| noteData               | object with `content`, `title` and `type` strings | is used to populate the note fields on edit pages (i.e. initial values) |
| noteMetadata           | object with `createdBy`, `createdDate`, `lastUpdatedBy`, `lastUpdatedDate` strings. `lastUpdatedBy` is the only one required | is used to display the note metadata on edit pages |
| noteTypes              | array of objects with `value` and `label` strings | is used for choosing the type of the note using a select |
| onSubmit               | func                        | a callback invoked on form submission |
| onCancel               | func                        | a callback invoked on canceling editing/creating a note |
| referredEntityData         | object with `name` and `type` strings | is used for displaying the data of an entity from which a user navigated on create/edit note page |
| linkedEntitiesTypes          | array of objects with `type` and `count` strings | is used for displaying a list of types of entities to which the note is assigned |
| entityTypeTranslationKeyMap | object whose keys are entity types and values are the translation keys for those entity types | is used to translate `referredEntityData`'s entity type  |
| entityTypePluralizedTranslationKeyMap | object whose keys are entity types and values are the translation keys for those entity types | is used to translate `linkedEntitiesTypes`'s entity types (pluralization is needed here)  |
| paneHeaderAppIcon | string | a name of an icon to be displayed in the pane header  |


**In case when the form is used for *creating* a note, required props are:**
* noteTypes
* onSubmit
* onCancel
* referredEntityData
* entityTypeTranslationKeyMap
* paneHeaderAppIcon

**In case when the form is used for *editing* a note, required props are:**
* noteData
* noteMetadata
* noteTypes
* onSubmit
* onCancel
* referredEntityData
* linkedEntitiesTypes
* entityTypeTranslationKeyMap
* entityTypePluralizedTranslationKeyMap
* paneHeaderAppIcon

## Usage (eholdings example)
**On a create note page**:
```javascript

const entityTypeTranslationKeyMap = {
  provider: 'ui-eholdings.notes.entityType.provider',
  package: 'ui-eholdings.notes.entityType.package',
  title: 'ui-eholdings.notes.entityType.title',
};

const referredEntityData = {
  type: 'provider',
  name: 'EBSCO',
};

class NoteCreateRoute extends Component {
  render() {
    return (
      <NoteForm
        noteTypes={noteTypes}
        referredEntityData={referredEntityData}
        entityTypeTranslationKeyMap={entityTypeTranslationKeyMap}
        paneHeaderAppIcon="eholdings"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }
}
```

**On a edit note page**:
```javascript


const entityTypeTranslationKeyMap = {
  provider: 'ui-eholdings.notes.entityType.provider',
  package: 'ui-eholdings.notes.entityType.package',
  title: 'ui-eholdings.notes.entityType.title',
};

const entityTypePluralizedTranslationKeyMap = {
  /*
   * In translations:
   * "notes.entityType.provider.pluralized": "{count} {count, plural, one {provider} other {providers}}",
   * "notes.entityType.package.pluralized": "{count} {count, plural, one {package} other {packages}}",
   * "notes.entityType.resource.pluralized": "{count} {count, plural, one {resource} other {resources}}"
   */
  provider: 'ui-eholdings.notes.entityType.provider.pluralized',
  package: 'ui-eholdings.notes.entityType.package.pluralized',
  title: 'ui-eholdings.notes.entityType.title.pluralized'
};


const noteTypes = [
  {
    label: 'Some note type',
    value: 'someType',
  },
  {
    label: 'Another type',
    value: 'anotherType',
  }
];

const noteData = {
  type: 'someType',
  title: 'Some note title',
  content: '<b>The note content is <u>here</u></b>',
};

const noteMetadata = {
  lastUpdatedDate: '2019-04-18T12:52:40.181+0000',
};

const referredEntityData = {
  type: 'provider',
  name: 'EBSCO',
};

const linkedEntitiesTypes = [
  { count: 1, type: 'provider' },
  { count: 4, type: 'package' },
  { count: 145, type: 'title' },
];

class NoteEditRoute extends Component {
  static propTypes = {
    noteTypes: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })).isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  render() {
    const {
      noteTypes,
      onSubmit,
      onCancel,
    } = this.props;

    return (
      <TitleManager record={noteData.title}>
        <NoteForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          noteData={noteData}
          noteMetadata={noteMetadata}
          noteTypes={noteTypes}
          referredEntityData={referredEntityData}
          linkedEntitiesTypes={linkedEntitiesTypes}
          entityTypeTranslationKeyMap={entityTypeTranslationKeyMap}
          entityTypePluralizedTranslationKeyMap={entityTypePluralizedTranslationKeyMap}
          paneHeaderAppIcon="eholdings"
        />
      </TitleManager>
    );
  }
}
```
