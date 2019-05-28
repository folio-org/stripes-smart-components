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

## Usage (eholdings example)
```js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import { NoteEditPage } from '@folio/stripes-smart-components';

import {
  entityTypesTranslationKeys,
  entityTypesPluralizedTranslationKeys,
} from '../constants';

const entityTypeTranslationKeys = {
  provider: 'ui-eholdings.notes.entityType.provider',
  package: 'ui-eholdings.notes.entityType.package',
  resource: 'ui-eholdings.notes.entityType.resource',
};

const entityTypePluralizedTranslationKeys = {
  provider: 'ui-eholdings.notes.entityType.provider.pluralized',
  package: 'ui-eholdings.notes.entityType.package.pluralized',
  resource: 'ui-eholdings.notes.entityType.resource.pluralized',
};

export default class NoteEditRoute extends Component {
  static propTypes = {
    history: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
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

  goToNoteView = () => {
    const {
      match,
      history,
    } = this.props;

    const { noteId } = match.params;
    const noteViewUrl = `/eholdings/notes/${noteId}`;

    history.replace(noteViewUrl);
  }

  render() {
    const {
      location,
      match,
    } = this.props;

    const { noteId } = match.params;
    const referredEntityData = location.state && this.getReferredEntityData();

    return (
      <NoteEditPage
        referredEntityData={referredEntityData}
        noteId={noteId}
        entityTypeTranslationKeys={entityTypeTranslationKeys}
        entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
        paneHeaderAppIcon="eholdings"
        domain="eholdings"
        navigateBack={this.goToNoteView}
      />
    );
  }
}
```
