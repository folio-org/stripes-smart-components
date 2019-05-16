## NoteCreatePage
A connected component for creating a note

## Description
This is a connected component used for creating a note. It's responsible for fetching note types, validating the note data entered by user, sending it to the back-end (mod-notes), handling navigation/redirection after a note is created or chancel button is clicked.

## Props
|         Name           |            Type             |                    Description                        |
| ---------------------- | --------------------------- | ----------------------------------------------------- |
| referredEntityData     | object with `name`, `type` and `id` strings | Is used for displaying the data of an entity from whose page a user navigated to the create note page. The newly created note will be attached to this entity |
| domain | string | Every note is associated with a domain (i.e application). This prop tells which domain the newly created note should be associated with |
| paneHeaderAppIcon | string | A name of an icon to be displayed in the pane header |
| navigateBack | func | A callback which is executed after the note is successfully saved or when cancellation button is clicked |
| entityTypesTranslationKeys | object whose keys are entity types and values are the translation keys for those entity types | is used to translate `referredEntityData`'s entity type |

## Usage (eholdings example)
```js
const entityTypeTranslationKeys = {
  provider: 'ui-eholdings.notes.entityType.provider',
  package: 'ui-eholdings.notes.entityType.package',
  resource: 'ui-eholdings.notes.entityType.resource',
};

export default class NoteCreateRoute extends Component {
  static propTypes = {
    history: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    location: ReactRouterPropTypes.location.isRequired,
  };

  referredEntityData = this.getReferredEntityData();

  getReferredEntityData() {
    const {
      referredName: name,
      referredType: type,
      referredId: id,
    } = this.parseQueryParams();

    return {
      name,
      type,
      id,
    };
  }

  parseQueryParams() {
    return queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });
  }

  render() {
    return (
      <NoteCreatePage
        referredEntityData={this.referredEntityData}
        entityTypesTranslationKeys={entityTypesTranslationKeys}
        paneHeaderAppIcon="eholdings"
        domain="eholdings"
        navigateBack={this.props.history.goBack}
      />
    );
  }
}
```