import PropTypes from 'prop-types';

export default PropTypes.shape({
  canDelete: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canView: PropTypes.bool.isRequired,
});
