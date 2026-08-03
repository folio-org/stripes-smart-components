import PropTypes from 'prop-types';

import css from './EmptyNotice.css';

const EmptyNotice = ({ text }) => (
  <p className={css.emptyNotice} data-testid="empty-notice">
    {text}
  </p>
);

EmptyNotice.propTypes = {
  text: PropTypes.node.isRequired,
};

export default EmptyNotice;
