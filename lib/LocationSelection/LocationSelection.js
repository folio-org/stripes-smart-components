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
    onChange: PropTypes.func,
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

  onChange(location) {
    this.props.onChange(location);
  }

  render() {
    const { stripes: { intl } } = this.context;
    const { onChange, name, placeholder } = this.props;
    const locationPlaceholder = placeholder || intl.formatMessage({ id: 'stripes-smart-components.ls.locationPlaceholder' });

    return (
      <this.locationInputConnected
        name={name}
        onChange={onChange}
        placeholder={locationPlaceholder}
        {...this.props}
      />
    );
  }
}
