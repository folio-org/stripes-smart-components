import PropTypes from 'prop-types';

const noteShape = PropTypes.shape({
  content: PropTypes.string.isRequired,
  creator: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }).isRequired,
  domain: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
  })),
  metadata: PropTypes.shape({
    createdByUserId: PropTypes.string.isRequired,
    createdByUsername: PropTypes.string.isRequired,
    createdDate: PropTypes.string.isRequired,
    updatedByUserId: PropTypes.string.isRequired,
    updatedDate: PropTypes.string.isRequired,
  }).isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  typeId: PropTypes.string.isRequired
});

export default noteShape;
