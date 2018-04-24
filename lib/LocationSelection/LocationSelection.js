import React from 'react';
import PropTypes from 'prop-types';

import LocationInput from './LocationInput';

export default class LocationSelection extends React.Component {
  static contextTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
  };

  static defaultProps = {
    name: 'locationId',
  };

  constructor(props, context) {
    super(props);
    this.locationInputConnected = context.stripes.connect(LocationInput, { dataKey: 'locationSelection' });
  }

  render() {
    const { stripes: { intl } } = this.context;
    const { name, placeholder } = this.props;
    const locationPlaceholder = placeholder || intl.formatMessage({ id: 'stripes-smart-components.ls.locationPlaceholder' });

    return (
      <this.locationInputConnected
        name={name}
        placeholder={locationPlaceholder}
        {...this.props}
      />
    );
  }
}
