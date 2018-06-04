import React from 'react';
import PropTypes from 'prop-types';
import css from './Notes.css';

class NoteCreator extends React.Component {
  static manifest = Object.freeze({
    noteCreator: {
      type: 'okapi',
      path: 'users/!{id}',
    },
  });

  static propTypes = {
    id: PropTypes.string,
    resources: PropTypes.shape({
      noteCreator: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  }

  getUserFullName() {
    const noteCreator = (this.props.resources.noteCreator || {}).records || [];
    if (noteCreator.length === 1 && noteCreator[0].id === this.props.id) {
      return `${noteCreator[0].personal.firstName} ${noteCreator[0].personal.lastName}`;
    }

    return this.props.id;
  }

  render() {
    return <div className={css.byLine}>{this.getUserFullName()}</div>;
  }
}

export default NoteCreator;
