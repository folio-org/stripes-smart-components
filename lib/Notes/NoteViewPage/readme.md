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

## Usage (eholdings example)
```js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Redirect } from 'react-router';

import { NoteViewPage } from '@folio/stripes/smart-components';


const entityTypeTranslationKeys = {
  provider: 'ui-eholdings.notes.entityType.provider',
  package: 'ui-eholdings.notes.entityType.package',
  title: 'ui-eholdings.notes.entityType.title',
  resource: 'ui-eholdings.notes.entityType.resource',
};

const entityTypePluralizedTranslationKeys = {
  provider: 'ui-eholdings.notes.entityType.provider.pluralized',
  package: 'ui-eholdings.notes.entityType.package.pluralized',
  title: 'ui-eholdings.notes.entityType.title.pluralized',
  resource: 'ui-eholdings.notes.entityType.resource.pluralized',
};

class NoteViewRoute extends Component {
  static propTypes = {
    history: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        noteId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  getReferredEntityData() {
    const {
      entityName: name,
      entityType: type,
      entityId: id,
    } = this.props.location.state;

    return {
      name,
      type,
      id,
    };
  }

  onEdit = (noteId) => {
    this.props.history.push({
      pathname: `/eholdings/notes/edit/${noteId}`,
      state: {
        entityId: '583-2356521',
        entityType: 'package',
        name: 'Blabla',
      }
    });
  }

  render() {
    const {
      history,
      location,
      match,
    } = this.props;

    const { noteId } = match.params;

    return location.state
      ? (
        <NoteViewPage
          entityTypeTranslationKeys={entityTypeTranslationKeys}
          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
          navigateBack={history.goBack}
          onEdit={this.onEdit}
          paneHeaderAppIcon="eholdings"
          referredEntityData={this.getReferredEntityData()}
          noteId={noteId}
        />
      )
      : <Redirect to="/eholdings" />;
  }
}

export default NoteViewRoute;