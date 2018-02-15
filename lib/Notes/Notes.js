import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Pane from '@folio/stripes-components/lib/Pane';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import NotesForm from './NotesForm';
import NoteRenderer from './NoteRenderer';
import css from './Notes.css';

class Notes extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    resources: PropTypes.shape({
      notes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      notes: PropTypes.shape({
        POST: PropTypes.func,
        DELETE: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }).isRequired,
    link: PropTypes.string,
    location: PropTypes.shape({
      search: PropTypes.string,
    }),
  }

  static manifest = Object.freeze({
    notes: {
      type: 'okapi',
      path: 'notes',
      records: 'notes',
      clear: false,
      GET: {
        params: {
          query: 'link=:{id}',
        },
      },
    },
  });

  constructor(props) {
    super(props);

    this.handleDelete = this.handleDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleSubmit(note) {
    this.props.mutator.notes.POST(note);
  }

  handleUpdate(note) {
    this.props.mutator.notes.PUT({
      id: note.id,
      link: note.link,
      text: note.text,
    });
  }

  handleDelete(id) {
    this.props.mutator.notes.DELETE({ id });
  }

  render() {
    const { stripes, link } = this.props;
    const notes = (this.props.resources.notes || {}).records || [];

    const notesQueryString = queryString.parse(this.props.location.search || '').notes;

    const noteList = notes.map((note, i) => (
      <NoteRenderer
        stripes={stripes}
        note={note}
        noteKey={note.id}
        onDelete={this.handleDelete}
        onUpdate={this.handleUpdate}
        key={`noteRender-${i}`}
        highlighted={notesQueryString === note.id}
      />));

    return (
      <Pane
        defaultWidth="20%"
        paneTitle="Notes"
        paneSub={`${notes.length} Note${notes.length === 1 ? '' : 's'}`}
        dismissible
        onClose={this.props.onToggle}
      >
        <IfPermission perm="notes.collection.get">
          <div className={css.notesList}>
            {noteList}
          </div>
        </IfPermission>
        <IfPermission perm="notes.item.post">
          <NotesForm
            id="userform-addnote"
            initialValues={{ link }}
            form="newNote"
            onSubmit={this.handleSubmit}
          />
        </IfPermission>
      </Pane>
    );
  }
}

export default Notes;
