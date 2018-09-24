import { sortBy, escapeRegExp } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row, Select, Selection } from '@folio/stripes-components';
import stripesForm from '@folio/stripes-form';
import { withStripes } from '@folio/stripes-core';
import { Field, getFormValues } from 'redux-form';

class LocationForm extends React.Component {
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
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired,
    }).isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  getCurrentValues() {
    const { stripes: { store } } = this.props;
    const state = store.getState();
    return getFormValues('locationForm')(state) || {};
  }

  // eslint-disable-next-line class-methods-use-this
  filter(value, data) {
    return data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));
  }

  translate(id) {
    const { stripes: { intl } } = this.props;
    return intl.formatMessage({ id: `stripes-smart-components.ll.${id}` });
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
      <form id="location-form">
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
              component={Selection}
              label={this.translate('location')}
              placeholder={this.translate('selectLocation')}
              name="locationId"
              id="locationId"
              onFilter={this.filter}
              dataOptions={[{ label: '\u00A0', value: '' }, ...locationOpts]}
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
                <Button
                  onClick={handleSubmit}
                  disabled={typeof curValues.locationId !== 'string'}
                  buttonStyle="primary"
                  fullWidth
                >
                  {this.translate('saveAndClose')}
                </Button>
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
})(withStripes(LocationForm));
