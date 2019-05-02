import { omit } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import EntryWrapper from './EntryWrapper';

class EntryManager extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);
    this.cEntryWrapper = props.stripes.connect(EntryWrapper);
  }

  render() {
    const props = omit(this.props, 'mutator');
    return (
      <div data-test-entry-manager>
        <this.cEntryWrapper {...props} />
      </div>
    );
  }
}

export default withRouter(EntryManager);
