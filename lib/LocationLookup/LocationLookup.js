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
    const { label, onLocationSelected, isTemporaryLocation, stripes } = this.props;
    const buttonLabel = label || <FormattedMessage id="stripes-smart-components.ll.locationLookup" />;

    return (
      <div>
        <Button
          key="searchButton"
          buttonStyle="link"
          onClick={this.openModal}
        >
          {buttonLabel}
        </Button>
        {this.state.openModal &&
          <this.connectedLocationModal
            open={this.state.openModal}
            onClose={this.closeModal}
            onLocationSelected={onLocationSelected}
            isTemporaryLocation={isTemporaryLocation}
            stripes={stripes}
          />
        }
      </div>
    );
  }
}

export default withStripes(LocationLookup);
