import React from 'react';
import PropTypes from 'prop-types';
import Notes from '@folio/stripes-components/lib/structures/Notes';

class NotesPane extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    mutator: PropTypes.shape({
      notes: PropTypes.shape({
        POST: PropTypes.func,
        DELETE: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }).isRequired,
    resources: PropTypes.shape({
      notes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
    }).isRequired,
    link: PropTypes.string,
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

    this.state = {
      updating: false,
    };

    this.handleDelete = this.handleDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleSubmit(note) {
    this.setState({ updating: true });
    this.props.mutator.notes.POST(note)
    .then(() => {
      this.setState({ updating: false });
    });
  }

  handleUpdate(note) {
    this.setState({ updating: true });
    this.props.mutator.notes.PUT({
      id: note.id,
      link: note.link,
      text: note.text,
    })
    .then(() => {
      this.setState({ updating: false });
    });
  }

  handleDelete(id) {
    this.setState({ updating: true });
    this.props.mutator.notes.DELETE({ id })
    .then(() => {
      this.setState({ updating: false });
    });
  }

  render() {
    return (<Notes
      notes={(this.props.resources.notes || {}).records || []}
      link={`${this.props.link}/${this.props.match.params.id}`}
      stripes={this.props.stripes}
      onToggle={this.props.onToggle}
      onSubmit={this.handleSubmit}
      onUpdate={this.handleUpdate}
      onDelete={this.handleDelete}
    />);
  }
}

export default NotesPane;
