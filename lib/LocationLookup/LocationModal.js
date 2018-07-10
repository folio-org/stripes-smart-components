import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';

import LocationForm from './LocationForm';

export default class LocationModal extends React.Component {
  static manifest = Object.freeze({
    institutions: {
      type: 'okapi',
      records: 'locinsts',
      path: 'location-units/institutions',
      accumulate: 'true',
      fetch: false,
    },
    campuses: {
      type: 'okapi',
      records: 'loccamps',
      path: 'location-units/campuses',
      accumulate: 'true',
      fetch: false,
    },
    libraries: {
      type: 'okapi',
      records: 'loclibs',
      path: 'location-units/libraries',
      accumulate: 'true',
      fetch: false,
    },
    locations: {
      type: 'okapi',
      records: 'locations',
      path: 'locations',
      accumulate: 'true',
      fetch: false,
    },
  });

  static propTypes = {
    open: PropTypes.bool,
    temporary: PropTypes.bool,
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
      locations: PropTypes.shape({
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
      locations: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }).isRequired,
  };

  static contextTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
    temporary: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.onLocationSelected = this.onLocationSelected.bind(this);
    this.fetchCampuses = this.fetchCampuses.bind(this);
    this.fetchLibraries = this.fetchLibraries.bind(this);
    this.fetchLocations = this.fetchLocations.bind(this);
    this.state = {};
  }

  componentDidMount() {
    this.fetchInstitutions();
  }

  onLocationSelected(data) {
    const { resources, onLocationSelected } = this.props;
    const locations = (resources.locations || {}).records || [];
    const location = locations.find(loc => loc.id === data.locationId);
    onLocationSelected(location);
    this.closeModal();
  }

  closeModal() {
    this.props.onClose();
  }

  fetchCampuses(institutionId) {
    this.props.mutator.campuses.reset();
    this.props.mutator.libraries.reset();
    this.props.mutator.locations.reset();
    this.setState({
      institutionId,
      campusId: null,
      libraryId: null,
      locationId: null,
    });

    if (!institutionId) return;

    const params = { query: `(institutionId=="${institutionId}")` };
    this.props.mutator.campuses.GET({ params }).then((campuses) => {
      if (campuses.length !== 1) return;
      const [campus] = campuses;
      this.setState({ campusId: campus.id });
      this.fetchLibraries(campus.id);
    });
  }

  fetchInstitutions() {
    this.props.mutator.institutions.reset();
    this.props.mutator.institutions.GET().then((institutions) => {
      if (institutions.length !== 1) return;
      const [inst] = institutions;
      this.setState({ institutionId: inst.id });
      this.fetchCampuses(inst.id);
    });
  }

  fetchLibraries(campusId) {
    this.props.mutator.libraries.reset();
    this.props.mutator.locations.reset();
    this.setState({
      campusId,
      libraryId: null,
      locationId: null
    });

    if (!campusId) return;

    const params = { query: `(campusId=="${campusId}")` };
    this.props.mutator.libraries.GET({ params }).then((libraries) => {
      if (libraries.length !== 1) return;
      const [library] = libraries;
      this.setState({ libraryId: library.id });
      this.fetchLocations(library.id);
    });
  }

  fetchLocations(libraryId) {
    this.props.mutator.locations.reset();
    this.setState({ libraryId, locationId: null });

    if (!libraryId) return;

    const params = {
      query: `(libraryId=="${libraryId}")`,
      limit: '100',
    };
    this.props.mutator.locations.GET({ params }).then((locations) => {
      if (locations.length !== 1) return;
      this.setState({ locationId: locations[0].id });
    });
  }

  translate(id, options) {
    const { stripes: { intl } } = this.context;
    return intl.formatMessage({ id: `stripes-smart-components.ll.${id}` }, options);
  }

  render() {
    const { resources, temporary } = this.props;
    const { campusId, libraryId, locationId, institutionId } = this.state;
    const institutions = (resources.institutions || {}).records || [];
    const campuses = (resources.campuses || {}).records || [];
    const libraries = (resources.libraries || {}).records || [];
    const locations = (resources.locations || {}).records || [];

    const type = this.translate((temporary) ? 'temporary' : 'permanent');
    const label = this.translate('selectLocationHeader', { type });

    return (
      <Modal
        enforceFocus={false}
        onClose={this.closeModal}
        size="large"
        open={this.props.open}
        label={label}
        dismissible
      >
        <LocationForm
          initialValues={{ campusId, libraryId, locationId, institutionId }}
          institutions={institutions}
          campuses={campuses}
          libraries={libraries}
          locations={locations}
          onInstitutionSelected={this.fetchCampuses}
          onCampusSelected={this.fetchLibraries}
          onLibrarySelected={this.fetchLocations}
          onSubmit={this.onLocationSelected}
          onCancel={this.closeModal}
        />
      </Modal>
    );
  }
}
