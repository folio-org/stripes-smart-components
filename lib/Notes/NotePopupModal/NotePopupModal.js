import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!style-loader!css-loader!react-quill/dist/quill.snow.css';

import {
  Modal,
  Button,
  ModalFooter,
} from '@folio/stripes-components';
import {
  stripesConnect,
  useStripes,
} from '@folio/stripes-core';

import useEscapeKey from '../hooks/useEscapeKey';

import { EventEmitter } from '../utils';
import { eventType } from '../constants';
import styles from './NotePopupModal.css';

const propTypes = {
  closeLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  deleteLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  domainName: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  entityId: PropTypes.string,
  entityType: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  label: PropTypes.node,
  mutator: PropTypes.shape({
    note: PropTypes.shape({
      DELETE: PropTypes.func.isRequired,
    }).isRequired,
    NotePopupModal_assignedNotes: PropTypes.shape({
      GET: PropTypes.func.isRequired,
    }),
    popupNote: PropTypes.shape({
      update: PropTypes.func.isRequired,
    }).isRequired,
  }),
  popUpPropertyName: PropTypes.string.isRequired,
};

const defaultProps = {
  entityId: '',
  label: <FormattedMessage id="stripes-smart-components.notes.popupModal.label" />,
  closeLabel: <FormattedMessage id="stripes-smart-components.notes.close" />,
  deleteLabel: <FormattedMessage id="stripes-smart-components.notes.popupModal.delete" />,
};

const manifest = Object.freeze({
  NotePopupModal_assignedNotes: {
    type: 'okapi',
    records: 'notes',
    accumulate: true,
    fetch: false,
    path: 'note-links/domain/!{domainName}/type/!{entityType}/id/!{entityId}',
    GET: {
      params: {
        status: 'assigned',
        limit: '10000',
        order: 'desc',
      },
    },
  },
  popupNote: {},
  note: {
    type: 'okapi',
    fetch: false,
    accumulate: true,
    DELETE: {
      path: 'notes/%{popupNote.id}',
    },
  },
});

const NotePopupModal = ({
  entityId,
  mutator,
  popUpPropertyName,
  deleteLabel,
  closeLabel,
  label,
}) => {
  const stripes = useStripes();
  const [userPopUpNotes, setUserPopUpNotes] = useState([]);
  const [currentPopUpNoteIdx, setCurrentPopUpNoteIdx] = useState(null);
  const [popupNote, setPopupNote] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const isNotesLoading = useRef(false);

  const getPopupNotesFromNotes = useCallback((notes) => {
    return notes.filter(note => !!note[popUpPropertyName]);
  }, [popUpPropertyName]);

  const handleGetNotesRequest = useCallback((notes) => {
    const userNotes = getPopupNotesFromNotes(notes);

    if (!userNotes.length) {
      return;
    }

    setUserPopUpNotes(userNotes);
    setCurrentPopUpNoteIdx(0);
    setPopupNote(userNotes[0]);
    mutator.popupNote.update({ id: userNotes[0].id });
    setIsOpen(true);
  }, [mutator.popupNote, getPopupNotesFromNotes]);

  useEffect(() => {
    if (entityId && !isNotesLoading.current) {
      mutator.NotePopupModal_assignedNotes.GET()
        .then(handleGetNotesRequest);

      isNotesLoading.current = true;
    }
  }, [entityId, handleGetNotesRequest, mutator.NotePopupModal_assignedNotes]);

  const incrementNoteIdx = (idx) => {
    setCurrentPopUpNoteIdx(idx);
    setPopupNote(userPopUpNotes[idx]);
    mutator.popupNote.update({ id: userPopUpNotes[idx].id });
    setIsOpen(true);
  };

  const onDelete = () => {
    mutator.note.DELETE({
      id: popupNote.id,
    })
      .then(() => {
        setIsOpen(false);
        EventEmitter.dispatch(eventType.DELETE_NOTE);
      })
      .then(() => {
        if (currentPopUpNoteIdx + 1 < userPopUpNotes.length) {
          incrementNoteIdx(currentPopUpNoteIdx + 1);
        } else {
          isNotesLoading.current = false;
          setPopupNote(null);
        }
      });
  };

  const onClose = () => {
    setIsOpen(false);
    if (currentPopUpNoteIdx + 1 < userPopUpNotes.length) {
      incrementNoteIdx(currentPopUpNoteIdx + 1);
    } else {
      isNotesLoading.current = false;
      setCurrentPopUpNoteIdx(null);
      setPopupNote(null);
    }
  };

  useEscapeKey(onClose);

  const hideDelete = !stripes.hasPerm('ui-notes.item.delete');

  const titleContent = popupNote?.title && (
    <div>
      <strong><FormattedMessage id="stripes-smart-components.title" />: </strong>
      {popupNote?.title}
    </div>
  );

  const popupContentHTML = { __html: popupNote?.content };

  const detailsContent = popupNote?.content && (
    <div className={styles['note-popup-details-container']}>
      <p className={styles['note-popup-details-label']}>
        <strong><FormattedMessage id="stripes-smart-components.details" />: </strong>
      </p>
      <div
        className={`ql-editor ${styles['note-details-container']}`}
        data-test-note-popup-modal-content
        dangerouslySetInnerHTML={popupContentHTML} // eslint-disable-line react/no-danger
      />
    </div>
  );

  const footer = (
    <ModalFooter>
      <Button
        data-test-note-popup-modal-close-button
        buttonStyle="primary"
        onClick={onClose}
      >
        {closeLabel}
      </Button>
      {
        !hideDelete && (
          <Button
            data-test-note-popup-modal-delete-button
            buttonStyle="default"
            onClick={onDelete}
          >
            {deleteLabel}
          </Button>
        )
      }
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      id="popup-note-modal"
      label={label}
      size="small"
      footer={footer}
      onClose={onClose}
    >
      {titleContent}
      {popupContentHTML.__html && detailsContent}
    </Modal>
  );
};

NotePopupModal.propTypes = propTypes;
NotePopupModal.defaultProps = defaultProps;
NotePopupModal.manifest = manifest;

export default stripesConnect(NotePopupModal);
