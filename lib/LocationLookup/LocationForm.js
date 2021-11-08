import { sortBy, escapeRegExp } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Col, Row, Select, Selection } from '@folio/stripes-components';
import stripesForm from '@folio/stripes-form';
import { useStripes } from '@folio/stripes-core';
import { Field, getFormValues } from 'redux-form';

import { useRemoteStorageMappings } from '../utils';

const LocationForm = ({
  handleSubmit,
  institutions,
  campuses,
  libraries,
  locations,
  onInstitutionSelected,
  onCampusSelected,
  onLibrarySelected,
  onCancel,
}) => {
  const intl = useIntl();
  const { store } = useStripes();
  const remoteMap = useRemoteStorageMappings();

  const getCurrentValues = () => {
    const state = store.getState();
    return getFormValues('locationForm')(state) || {};
  };

  const filter = (value, data) => {
    return data.filter(o => new RegExp(escapeRegExp(value), 'i').test(o.label));
  };

  const curValues = getCurrentValues();
  const institutionOpts = institutions.map(inst => ({ label: inst.name, value: inst.id }));
  const campusOpts = campuses.map(campus => ({ label: campus.name, value: campus.id }));
  const libraryOpts = libraries.map(library => ({ label: library.name, value: library.id }));
  const locationOpts = sortBy(
    locations,
    [loc => loc.name.toLowerCase(), loc => loc.code.toLowerCase()]
  ).map(({ name, code, id }) => {
    const remoteLabel = remoteMap[id] ? intl.formatMessage({ id: 'stripes-smart-components.ll.remoteLabel' }) : '';
    return {
      label: `${name} (${code}) ${remoteLabel}`,
      value: id,
    };
  });

  return (
    <form id="location-form">
      <Row>
        <Col xs={6}>
          <Field
            disabled={institutions.length <= 1}
            label={intl.formatMessage({ id: 'stripes-smart-components.ll.institution' })}
            name="institutionId"
            onChange={e => onInstitutionSelected(e.target.value)}
            dataOptions={[
              { label: intl.formatMessage({ id: 'stripes-smart-components.ll.selectInstitution' }), value: '' },
              ...institutionOpts
            ]}
            component={Select}
          />
          <Field
            disabled={campuses.length <= 1}
            label={intl.formatMessage({ id: 'stripes-smart-components.ll.campus' })}
            name="campusId"
            onChange={e => onCampusSelected(e.target.value)}
            dataOptions={[
              { label: intl.formatMessage({ id: 'stripes-smart-components.ll.selectCampus' }), value: '' },
              ...campusOpts
            ]}
            component={Select}
          />
          <Field
            disabled={libraries.length <= 1}
            label={intl.formatMessage({ id: 'stripes-smart-components.ll.library' })}
            name="libraryId"
            onChange={e => onLibrarySelected(e.target.value)}
            dataOptions={[
              { label: intl.formatMessage({ id: 'stripes-smart-components.ll.selectLibrary' }), value: '' },
              ...libraryOpts
            ]}
            component={Select}
          />
        </Col>

        <Col xs={6}>
          <Field
            disabled={locations.length <= 1}
            component={Selection}
            label={intl.formatMessage({ id: 'stripes-smart-components.ll.location' })}
            placeholder={intl.formatMessage({ id: 'stripes-smart-components.ll.selectLocation' })}
            name="locationId"
            id="locationId"
            onFilter={filter}
            dataOptions={[{ label: '\u00A0', value: '' }, ...locationOpts]}
          />
        </Col>
      </Row>

      <br />
      <Row>
        <Col xs={12}>
          <Row end="xs">
            <Col xs={2}>
              <Button onClick={onCancel} fullWidth data-test-button-cancel>
                <FormattedMessage id="stripes-smart-components.ll.cancel" />
              </Button>
            </Col>
            <Col xs={2}>
              <Button
                onClick={handleSubmit}
                disabled={typeof curValues.locationId !== 'string'}
                buttonStyle="primary"
                fullWidth
                data-test-button-save
              >
                <FormattedMessage id="stripes-smart-components.ll.saveAndClose" />
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </form>
  );
};

LocationForm.propTypes = {
  campuses: PropTypes.arrayOf(PropTypes.object),
  handleSubmit: PropTypes.func.isRequired,
  institutions: PropTypes.arrayOf(PropTypes.object),
  libraries: PropTypes.arrayOf(PropTypes.object),
  locations: PropTypes.arrayOf(PropTypes.object),
  onCampusSelected: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onInstitutionSelected: PropTypes.func.isRequired,
  onLibrarySelected: PropTypes.func.isRequired,
};

export default stripesForm({
  form: 'locationForm',
  navigationCheck: false,
  enableReinitialize: true,
})(LocationForm);
