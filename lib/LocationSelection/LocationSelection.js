import React from 'react';
import PropTypes from 'prop-types';
import Selection from '@folio/stripes-components/lib/Selection';

import LocationInput from './LocationInput';

export default class LocationSelection extends React.Component {
  static contextTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  static propTypes = {
    onLocationSelected: PropTypes.func.isRequired,
    name: PropTypes.string,
    temporary: PropTypes.bool,
  };

  static defaultProps = {
    name: 'locationId',
  };

  constructor(props, context) {
    super(props);
    this.locationInputConnected = context.stripes.connect(LocationInput);
  }

  translate(id, options) {
    const { stripes: { intl } } = this.context;
    return intl.formatMessage({ id: `stripes-smart-components.ls.${id}` }, options);
  }

  onLocationSelected(location) {
    this.props.onLocationSelected(location);
  }

  render() {
    const { onLocationSelected, name, temporary } = this.props;
    const label = this.translate((temporary) ? 'temporaryLocation' : 'permanentLocation');

    return (
      <this.locationInputConnected
        onLocationSelected={onLocationSelected}
        name={name}
        label={label}
        temporary={temporary}
      />
    );
  }
}
