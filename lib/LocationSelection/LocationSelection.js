import React from 'react';
import PropTypes from 'prop-types';
import { withStripes } from '@folio/stripes-core';

import LocationInput from './LocationInput';

class LocationSelection extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }),
  };

  static defaultProps = {
    name: 'locationId',
  };

  constructor(props) {
    super(props);
    this.locationInputConnected = props.stripes.connect(LocationInput, { dataKey: 'locationSelection' });
  }

  render() {
    const { stripes, name, placeholder } = this.props;
    const locationPlaceholder =
      placeholder || stripes.intl.formatMessage({ id: 'stripes-smart-components.ls.locationPlaceholder' });

    return (
      <this.locationInputConnected
        name={name}
        placeholder={locationPlaceholder}
        {...this.props}
      />
    );
  }
}

export default withStripes(LocationSelection);
