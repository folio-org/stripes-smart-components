import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withStripes } from '@folio/stripes-core';

import LocationInput from './LocationInput';

class LocationSelection extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
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
    const { name, placeholder } = this.props;

    return (
      <FormattedMessage id="stripes-smart-components.ls.locationPlaceholder">
        {defaultPlaceholder => (
          <this.locationInputConnected
            name={name}
            placeholder={placeholder || defaultPlaceholder}
            {...this.props}
          />
        )}
      </FormattedMessage>
    );
  }
}

export default withStripes(LocationSelection);
