import { sortBy } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Select from '@folio/stripes-components/lib/Select';
import Button from '@folio/stripes-components/lib/Button';
import stripesForm from '@folio/stripes-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Field, getFormValues } from 'redux-form';

class LocationForm extends React.Component {
  static contextTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired,
    }).isRequired,
  };

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    institutions: PropTypes.arrayOf(PropTypes.object),
    campuses: PropTypes.arrayOf(PropTypes.object),
    libraries: PropTypes.arrayOf(PropTypes.object),
    locations: PropTypes.arrayOf(PropTypes.object),
    onInstitutionSelected: PropTypes.func.isRequired,
    onCampusSelected: PropTypes.func.isRequired,
    onLibrarySelected: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {};
    this.onSave = this.onSave.bind(this);
  }

  translate(id) {
    const { stripes: { intl } } = this.context;
    return intl.formatMessage({ id: `stripes-smart-components.ll.${id}` });
  }

  onSave(data) {
    const { locations, onSubmit } = this.props;
    const location = locations.find(loc => loc.id === data.locationId);
    onSubmit(location);
  }

  getCurrentValues() {
    const { stripes: { store } } = this.context;
    const state = store.getState();
    return getFormValues('locationForm')(state) || {};
  }

  render() {
    const {
      handleSubmit,
      institutions,
      campuses,
      libraries,
      locations,
      onInstitutionSelected,
      onCampusSelected,
      onLibrarySelected,
      onCancel,
    } = this.props;

    const curValues = this.getCurrentValues();
    const institutionOpts = institutions.map(inst => ({ label: inst.name, value: inst.id }));
    const campusOpts = campuses.map(campus => ({ label: campus.name, value: campus.id }));
    const libraryOpts = libraries.map(library => ({ label: library.name, value: library.id }));
    const locationOpts = sortBy(locations, ['name', 'code']).map((loc) => {
      return { label: `${loc.name} - (${loc.code})`, value: loc.id };
    });

    return (
      <form id="location-form" onSubmit={handleSubmit(this.onSave)}>
        <Row>
          <Col xs={6}>
            <Field
              disabled={institutions.length <= 1}
              label={this.translate('institution')}
              name="institutionId"
              onChange={e => onInstitutionSelected(e.target.value)}
              dataOptions={[{ label: this.translate('selectInstitution'), value: '' }, ...institutionOpts]}
              component={Select}
            />
            <Field
              disabled={campuses.length <= 1}
              label={this.translate('campus')}
              name="campusId"
              onChange={e => onCampusSelected(e.target.value)}
              dataOptions={[{ label: this.translate('selectCampus'), value: '' }, ...campusOpts]}
              component={Select}
            />
            <Field
              disabled={libraries.length <= 1}
              label={this.translate('library')}
              name="libraryId"
              onChange={e => onLibrarySelected(e.target.value)}
              dataOptions={[{ label: this.translate('selectLibrary'), value: '' }, ...libraryOpts]}
              component={Select}
            />
          </Col>
          <Col xs={6}>
            <Field
              disabled={locations.length <= 1}
              label={this.translate('location')}
              name="locationId"
              dataOptions={[{ label: this.translate('selectLocation'), value: '' }, ...locationOpts]}
              component={Select}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <Row end="xs">
              <Col xs={2}>
                <Button onClick={onCancel} fullWidth>{this.translate('cancel')}</Button>
              </Col>
              <Col xs={2}>
                <Button disabled={!curValues.locationId} type="submit" buttonStyle="primary" fullWidth>{this.translate('saveAndClose')}</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </form>
    );
  }
}

export default stripesForm({
  form: 'locationForm',
  navigationCheck: false,
  enableReinitialize: true,
})(LocationForm);
