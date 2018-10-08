import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { withStripes } from '@folio/stripes-core';

import LocationInput from './LocationInput';

class LocationSelection extends React.Component {
  static propTypes = {
    intl: intlShape,
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
    const { intl: { formatMessage }, name, placeholder } = this.props;
    const locationPlaceholder =
      placeholder || formatMessage({ id: 'stripes-smart-components.ls.locationPlaceholder' });

    return (
      <this.locationInputConnected
        name={name}
        placeholder={locationPlaceholder}
        {...this.props}
      />
    );
  }
}

export default withStripes(injectIntl(LocationSelection));
