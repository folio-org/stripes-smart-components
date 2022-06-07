import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStripes } from '@folio/stripes-core';

export default function connectStripes(component) {
  class Connected extends Component {
    static propTypes = {
      stripes: PropTypes.object,
    }

    constructor(props) {
      super(props);
      this.connected = props.stripes.connect(component);
    }

    render() {
      return <this.connected {...this.props} />;
    }
  }

  return withStripes(Connected);
}
