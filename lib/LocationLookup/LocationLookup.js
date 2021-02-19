import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withStripes } from '@folio/stripes-core';
import { Button } from '@folio/stripes-components';
import LocationModal from './LocationModal';

class LocationLookup extends React.Component {
  static propTypes = {
    isTemporaryLocation: PropTypes.bool,
    label: PropTypes.node,
    marginBottom0: PropTypes.bool,
    onLocationSelected: PropTypes.func.isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { openModal: false };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.connectedLocationModal = props.stripes.connect(LocationModal, { dataKey: 'locationLookup' });
  }

  onSave() {
    this.closeModal();
  }

  closeModal() {
    this.setState({ openModal: false });
  }

  openModal() {
    this.setState({ openModal: true });
  }

  render() {
    const { label, marginBottom0, onLocationSelected, isTemporaryLocation, stripes, ...rest } = this.props;

    return (
      <div>
        <Button
          data-test-location-lookup-button
          key="searchButton"
          buttonStyle="link"
          marginBottom0={marginBottom0}
          onClick={this.openModal}
        >
          {label}
        </Button>
        {this.state.openModal &&
          <this.connectedLocationModal
            open={this.state.openModal}
            onClose={this.closeModal}
            onLocationSelected={onLocationSelected}
            isTemporaryLocation={isTemporaryLocation}
            stripes={stripes}
            {...rest}
          />
        }
      </div>
    );
  }
}

LocationLookup.defaultProps = {
  isTemporaryLocation: false,
  label: <FormattedMessage id="stripes-smart-components.ll.locationLookup" />,
  marginBottom0: false,
};

export default withStripes(LocationLookup);
