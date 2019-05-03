import PropTypes from 'prop-types';

export const noteDataShape = PropTypes.shape({
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

export const referredRecordShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

export const noteTypesShape = PropTypes.arrayOf(PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
}));

export const linkedRecordsShape = PropTypes.arrayOf(PropTypes.shape({
  count: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
}));
