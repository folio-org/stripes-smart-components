import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import {
  stripesConnect,
  TitleManager,
} from '@folio/stripes-core';
import { Icon } from '@folio/stripes-components';

import { NOTES_PATH } from '../constants';
import NoteView from '../NoteForm';
import noteShape from '../response-shapes';

@stripesConnect
class NoteViewPage extends Component {
  static propTypes = {
    domain: PropTypes.string.isRequired,
    entityTypePluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string),
    linkedEntityTypes: linkedEntityTypesShape,
    mutator: PropTypes.shape({
      note: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    navigateBack: PropTypes.func.isRequired,
    noteId: PropTypes.string.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      note: noteShape,
    }),
  }

  static manifest = Object.freeze({
    note: {
      type: 'okapi',
      accumulate: true,
      path: NOTES_PATH,
      fetch: true,
      GET: {
        path: 'notes/!{noteId}',
      }
    },
  });

  state = { };

  renderSpinner() {
    return (
      <Icon icon="spinner-ellipsis" />
    );
  }

  render() {
    const {
      referredEntityData,
      entityTypeTranslationKeys,
      paneHeaderAppIcon,
      navigateBack,
      linkedEntityTypes
    } = this.props;

    const noteLoaded = get(this.props, ['resources', 'note', 'hasLoaded']);

    return noteLoaded
      ? (
        <FormattedMessage id="stripes-smart-components.notes.newNote">
          {pageTitle => (
            <TitleManager record={pageTitle}>
              <NoteView
                linkedEntityTypes={linkedEntityTypes}
                referredEntityData={referredEntityData}
                entityTypeTranslationKeys={entityTypeTranslationKeys}
                paneHeaderAppIcon={paneHeaderAppIcon}
                onCopy={() => console.log('onCopy')}
                onCancel={() => console.log('oncancel')}
                onEdit={() => console.log('onEdit')}
                onUnassign={() => console.log('onUnassign')}
                onDelete={() => console.log('onDelete')}
              />
            </TitleManager>
          )}
        </FormattedMessage>
      )
      : this.renderSpinner();
  }
}

export default NoteViewPage;
