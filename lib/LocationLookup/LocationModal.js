import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';

import LocationForm from './LocationForm';

export default class LocationModal extends React.Component {
  static contextTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onLocationSelected: PropTypes.func.isRequired,
    resources: PropTypes.shape({
      institutions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      campuses: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      libraries: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      institutions: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      campuses: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      libraries: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    institutions: {
      type: 'okapi',
      records: 'locinsts',
      path: 'location-units/institutions',
    },
    campuses: {
      type: 'okapi',
      records: 'campuses',
      path: 'location-units/campuses',
      accumulate: 'true',
      fetch: false,
    },
    libraries: {
      type: 'okapi',
      records: 'libraries',
      path: 'location-units/libraries',
      accumulate: 'true',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.onLocationSelected = this.onLocationSelected.bind(this);
  }

  onInstitutionSelected() {

  }

  onCampusSelected() {

  }

  onLibrarySelected() {

  }

  onLocationSelected() {
    this.props.onLocationSelected();
  }

  closeModal() {
    this.props.onClose();
  }

  render() {
    const institutions = (this.props.resources.institutions || {}).records || [];
    const campuses = (this.props.resources.campuses || {}).records || [];
    const libraries = (this.props.resources.libraries || {}).records || [];
    const initialValues = {};

    const { stripes: { intl } } = this.context;
    const label = intl.formatMessage({ id: 'stripes-core.label.selectPermanentLocation' });

    return (
      <Modal onClose={this.closeModal} size="large" open={this.props.open} label={label} dismissible>
        <LocationForm
          initialValues={initialValues}
          institutions={institutions}
          campuses={campuses}
          libraries={libraries}
          onInstitutionSelected={this.onInstitutionSelected}
          onCampusSelected={this.onCampusSelected}
          onLibrarySelected={this.onLibrarySelected}
          onSubmit={this.onLocationSelected}
        />
      </Modal>
    );
  }
}
