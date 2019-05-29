import PropTypes from 'prop-types';

export const noteDataShape = PropTypes.shape({
  content: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

export const referredEntityDataShape = PropTypes.oneOfType([
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }),
  PropTypes.bool
]);

export const noteTypesShape = PropTypes.arrayOf(PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
}));
