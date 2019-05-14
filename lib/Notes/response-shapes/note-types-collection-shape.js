import PropTypes from 'prop-types';
import noteTypeShape from './note-type-shape';

const noteTypesCollectionShape = PropTypes.shape({
  noteTypes: PropTypes.arrayOf(noteTypeShape).isRequired,
  totalRecords: PropTypes.number.isRequired,
});

export default noteTypesCollectionShape;
