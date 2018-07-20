import React from 'react';
import PropTypes from 'prop-types';
import { withStripes } from '@folio/stripes-core/src/StripesContext';
import Button from '@folio/stripes-components/lib/Button';
import LocationModal from './LocationModal';

class LocationLookup extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    onLocationSelected: PropTypes.func.isRequired,
    isTemporaryLocation: PropTypes.bool,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
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
    const { intl } = stripes;
    const buttonLabel = label || intl.formatMessage({ id: 'stripes-smart-components.ll.locationLookup' });

    return (
      <div>
        <Button
          key="searchButton"
          buttonStyle="link"
          onClick={this.openModal}
          title={buttonLabel}
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
