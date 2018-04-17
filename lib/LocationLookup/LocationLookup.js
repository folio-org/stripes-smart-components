import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import LocationModal from './LocationModal';

export default class LocationLookup extends React.Component {
  static contextTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  static propTypes = {
    label: PropTypes.string,
    onLocationSelected: PropTypes.func.isRequired,
    temporary: PropTypes.bool,
  };

  constructor(props, context) {
    super(props);

    this.state = { openModal: false };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.connectedLocationModal = context.stripes.connect(LocationModal, { dataKey: 'locationLookup' });
  }

  openModal() {
    this.setState({ openModal: true });
  }

  closeModal() {
    this.setState({ openModal: false });
  }

  onSave() {
    this.closeModal();
  }

  render() {
    const { label, onLocationSelected, temporary } = this.props;
    const { stripes: { intl } } = this.context;
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
            temporary={temporary}
          />
        }
      </div>
    );
  }
}
