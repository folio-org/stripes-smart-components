import PropTypes from 'prop-types';

const noteTypeShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  metadata: PropTypes.shape({
    createdByUserId: PropTypes.string.isRequired,
    createdByUsername: PropTypes.string.isRequired,
    createdDate: PropTypes.string.isRequired,
    updatedByUserId: PropTypes.string.isRequired,
    updatedDate: PropTypes.string.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  usage: PropTypes.shape({
    noteTotal: PropTypes.number.isRequired,
  }).isRequired,
});

export default noteTypeShape;
