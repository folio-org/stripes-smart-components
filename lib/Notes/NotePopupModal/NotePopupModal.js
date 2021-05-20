import {
  useState,
  useEffect,
  useCallback,
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

const propTypes = {
  closeLabel: PropTypes.oneOf([PropTypes.node, PropTypes.string]),
  deleteLabel: PropTypes.oneOf([PropTypes.node, PropTypes.string]),
  domainName: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  entityId: PropTypes.string,
  entityType: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  label: PropTypes.node,
  mutator: PropTypes.shape({
    assignedNotes: PropTypes.shape({
      GET: PropTypes.func.isRequired,
    }),
    note: PropTypes.shape({
      DELETE: PropTypes.func.isRequired,
    }).isRequired,
    popupNote: PropTypes.shape({
      update: PropTypes.func.isRequired,
    }).isRequired,
  }),
  popUpPropertyName: PropTypes.string.isRequired,
};

const defaultProps = {
  entityId: '',
  label: <FormattedMessage id="stripes-smart-components.notes.popupModal.label" />,
  closeLabel: <FormattedMessage id="stripes-smart-components.notes.cancel" />,
  deleteLabel: <FormattedMessage id="stripes-smart-components.notes.popupModal.delete" />,
};

const manifest = Object.freeze({
  assignedNotes: {
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

const SESSION_STORAGE_KEY_PREFIX = 'popUpNoteDismissed';

const NotePopupModal = ({
  entityId,
  mutator,
  popUpPropertyName,
  deleteLabel,
  closeLabel,
  label,
}) => {
  const stripes = useStripes();
  const [popupNote, setPopupNote] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const getSessionStorageKey = (noteId) => `${SESSION_STORAGE_KEY_PREFIX}.${noteId}`;

  const checkIsNoteDismissed = useCallback((noteId) => {
    return JSON.parse(sessionStorage.getItem(getSessionStorageKey(noteId)));
  }, []);

  const getPopupNoteFromNotes = useCallback((notes) => {
    return notes.find(note => !!note[popUpPropertyName]);
  }, [popUpPropertyName]);

  const handleGetNotesRequest = useCallback((notes) => {
    const note = getPopupNoteFromNotes(notes);
    console.log(note);

    if (!note) {
      return;
    }

    setPopupNote(note);
    mutator.popupNote.update({ id: note.id });
    setIsOpen(!checkIsNoteDismissed(note.id));
  }, [mutator.popupNote, getPopupNoteFromNotes, checkIsNoteDismissed]);

  useEffect(() => {
    if (!popupNote && entityId) {
      mutator.assignedNotes.GET().then(handleGetNotesRequest);
    }
  }, [entityId, handleGetNotesRequest, popupNote]);

  const onDelete = () => {
    mutator.note.DELETE({
      id: popupNote.id,
    })
      .then(() => setIsOpen(false));
  };

  const onClose = () => {
    sessionStorage.setItem(getSessionStorageKey(popupNote.id), true);
    setIsOpen(false);
  };


  console.log(stripes.hasPerm('ui-notes.item.delete'));
  const hideDelete = !stripes.hasPerm('ui-notes.item.delete');

  const popupContentHTML = { __html: popupNote?.content };

  const footer = (
    <ModalFooter>
      {
        !hideDelete && (
          <Button
            data-test-note-popup-modal-delete-button
            buttonStyle="primary"
            onClick={onDelete}
          >
            {deleteLabel}
          </Button>
        )
      }
      <Button
        data-test-note-popup-modal-close-button
        buttonStyle="default"
        onClick={onClose}
      >
        {closeLabel}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      id="popup-note-modal"
      label={label}
      size="small"
      footer={footer}
    >
      <div
        className="ql-editor"
        data-test-note-popup-modal-content
        dangerouslySetInnerHTML={popupContentHTML}
      />
    </Modal>
  );
};

NotePopupModal.propTypes = propTypes;
NotePopupModal.defaultProps = defaultProps;
NotePopupModal.manifest = manifest;

export default stripesConnect(NotePopupModal);
