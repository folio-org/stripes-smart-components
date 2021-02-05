import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { uniqueId, pickBy } from 'lodash';
import useSwr from 'swr';

import { Button, Callout, Col, ConfirmationModal, Modal, Pane, Paneset, Row, Loading } from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { useOkapiKy } from '@folio/stripes-core';

import EditableList from '../EditableList';
import css from './ControlledVocab.css';
import refdataActuators from './actuators-refdata';

const ControlledVocab = (props) => {
  const {
    actionProps,
    actionSuppressor,
    actuatorType,
    baseUrl,
    columnMapping,
    formatter,
    hiddenFields,
    id: elementId,
    itemTemplate,
    label,
    labelSingular,
    limitParam,
    listFormLabel,
    listSuppressor,
    listSuppressorText,
    objectLabel,
    parseRow,
    preCreateHook,
    preUpdateHook,
    readOnlyFields,
    records,
    rowFilter,
    rowFilterFunction,
    sortby,
    stripes,
    validate,
    visibleFields,
  } = props;
  const ky = useOkapiKy();

  // the CV things
  const { data: values, mutate: mutateValues } = useSwr(
    ['stripes-smart-components', 'controlled-vocab', baseUrl],
    () => ky(`${baseUrl}?query=cql.allRecords=1 sortby ${sortby}&${limitParam}=2000`).json(),
  );
  if (values) {
    values.records = values[records];
  }

  /**
   * build a list of the ids of users who have updated CV items so
   * we can look them up all at once
   */
  const updatersQuery = () => {
    let ids = [];
    if (stripes.hasPerm('users.collection.get')) {
      // convert the list of values-plus-metadata to a de-duped list of
      // metadata-userids
      ids = [...new Set((values ? values.records : [])
        .filter(r => r.metadata && r.metadata.updatedByUserId)
        .map(r => `id=="${r.metadata.updatedByUserId}"`))
      ];
    }
    return ids.length ? `users?query=(${ids.join(' or ')})` : null;
  };

  const { data: updaters } = useSwr(
    updatersQuery,
    (query) => ky(query).json(),
  );

  if (updaters) {
    updaters.records = updaters.users;
  }

  const [confirmDiaglogIsVisible, setConfirmDiaglogIsVisible] = useState(false);
  const [itemInUseDialogIsVisible, setItemInUseDialogIsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [primaryField] = useState(visibleFields[0]);

  const id = elementId ?? uniqueId('controlled-vocab-');
  let calloutRef = useRef(null);

  let deleteItemResolve = () => {};
  let deleteItemReject = () => {};

  const confirmDialog = (itemId) => {
    const itemToConfirm = values.records.find(t => t.id === itemId);

    setConfirmDiaglogIsVisible(true);
    setSelectedItem(itemToConfirm);

    return new Promise((resolve, reject) => {
      deleteItemResolve = resolve;
      deleteItemReject = reject;
    });
  };

  const showDeletionSuccessCallout = (item) => {
    if (calloutRef) {
      const message = (
        <SafeHTMLMessage
          id="stripes-smart-components.cv.termDeleted"
          values={{
            type: labelSingular,
            term: item[primaryField],
          }}
        />
      );

      calloutRef.sendCallout({ message });
    }
  };

  const hideConfirmDialog = () => {
    setConfirmDiaglogIsVisible(false);
    setSelectedItem({});
  };

  const hideItemInUseDialog = () => {
    setItemInUseDialogIsVisible(false);
    setSelectedItem({});
  };

  const onCreateItem = (item) => {
    return mutateValues(ky.post(baseUrl, { json: preCreateHook(item) }));
  };

  const onDeleteItem = () => {
    return ky.delete(`${baseUrl}/${selectedItem.id}`)
      .then(() => {
        mutateValues();
        showDeletionSuccessCallout(selectedItem);
        deleteItemResolve();
      })
      .catch(() => {
        setItemInUseDialogIsVisible(true);
        deleteItemReject();
      })
      .finally(() => hideConfirmDialog());
  };

  const onUpdateItem = (item) => {
    return ky.put(`${baseUrl}/${item.id}`, { json: preUpdateHook(item) })
      .then(() => mutateValues());
  };

  const filteredRows = (rows) => {
    if (!rowFilterFunction) {
      return rows;
    }

    return rows.filter(row => rowFilterFunction(row));
  };

  const parseRows = (rows) => {
    return parseRow ? rows.map(parseRow) : rows;
  };

  const cvValidate = ({ items }) => {
    if (Array.isArray(items)) {
      const errors = [];

      items.forEach((item, index) => {
        // Start with getting a validation check from the parent component.
        const itemErrors = validate(item, index, items) || {};

        // Check if the primary field has had data entered into it.
        if (!item[primaryField]) {
          itemErrors[primaryField] = <FormattedMessage id="stripes-core.label.missingRequiredField" />;
        }

        // Add the errors if we found any for this record.
        if (itemErrors && Object.keys(itemErrors).length) {
          errors[index] = itemErrors;
        }
      });

      if (errors.length) {
        return { items: errors };
      }
    }

    return {};
  };

  const renderItemInUseDialog = () => {
    const type = labelSingular;

    return (
      <Modal
        open={itemInUseDialogIsVisible}
        label={<FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermHeader" values={{ type }} />}
        size="small"
      >
        <Row>
          <Col xs>
            <FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermMessage" values={{ type }} />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Button buttonStyle="primary" onClick={hideItemInUseDialog}>
              <FormattedMessage id="stripes-core.label.okay" />
            </Button>
          </Col>
        </Row>
      </Modal>
    );
  };

  const renderLastUpdated = (metadata) => {
    let record;
    if (updaters) {
      record = updaters.records.find(r => r.id === metadata.updatedByUserId);
    }

    let user = '';
    if (record) {
      const { firstName, lastName } = record.personal;
      const name = firstName ? `${lastName}, ${firstName}` : lastName;
      user = <Link to={`/users/view/${metadata.updatedByUserId}`}>{name}</Link>;
    }

    return (
      <div className={css.lastUpdated}>
        <FormattedMessage
          id="stripes-smart-components.cv.updatedAtAndBy"
          values={{
            date: <FormattedDate value={metadata.updatedDate} />,
            user,
          }}
        />
      </div>
    );
  };

  let actuators = {
    onCreate: onCreateItem,
    onDelete: onDeleteItem,
    onUpdate: onUpdateItem,
  };
  if (actuatorType === 'refdata') {
    actuators = refdataActuators({
      ky,
      baseUrl,
      preCreateHook,
      preUpdateHook,
      selectedItem,
      showDeletionSuccessCallout,
      deleteItemResolve,
      deleteItemReject,
    });
  }

  const type = labelSingular;
  const term = selectedItem ? selectedItem[primaryField] : null;

  const modalMessage = (
    <SafeHTMLMessage
      id="stripes-smart-components.cv.termWillBeDeleted"
      values={{ type, term }}
    />
  );

  const rows = parseRows(filteredRows((values && values.records) ? values.records : []));

  const hideList = listSuppressor && listSuppressor();
  const dataProps = pickBy(props, (_, key) => /^data-test/.test(key));


  if (!values) return <div>LOADING</div>;

  return (
    <Paneset id={id} {...dataProps}>
      <Pane defaultWidth="fill" fluidContentWidth paneTitle={label}>
        {rowFilter}
        { hideList && listSuppressorText && <div>{listSuppressorText}</div> }
        { !hideList &&
          <EditableList
            {...props}
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={rows}
            totalCount={rows.length}
            createButtonLabel={<FormattedMessage id="stripes-core.button.new" />}
            label={listFormLabel || label}
            itemTemplate={itemTemplate}
            visibleFields={[
              ...visibleFields,
              'lastUpdated',
              'numberOfObjects',
            ].filter(field => !hiddenFields.includes(field))}
            columnMapping={{
              name: labelSingular,
              lastUpdated: <FormattedMessage id="stripes-smart-components.cv.lastUpdated" />,
              numberOfObjects: (
                <FormattedMessage
                  id="stripes-smart-components.cv.numberOfObjects"
                  values={{ objects: objectLabel }}
                />
              ),
              ...columnMapping,
            }}
            formatter={{
              lastUpdated: (item) => {
                if (item.metadata) {
                  return renderLastUpdated(item.metadata);
                }

                return '-';
              },
              ...formatter,
            }}
            readOnlyFields={[
              ...readOnlyFields,
              'lastUpdated',
              'numberOfObjects',
            ]}
            actionSuppression={actionSuppressor}
            actionProps={actionProps}
            onUpdate={actuators.onUpdate}
            onCreate={actuators.onCreate}
            onDelete={confirmDialog}
            isEmptyMessage={
              !values
                ? <Loading />
                : (
                  <FormattedMessage
                    id="stripes-smart-components.cv.noExistingTerms"
                    values={{ terms: label }}
                  />
                )
            }
            validate={cvValidate}
          />
        }
        <ConfirmationModal
          id="delete-controlled-vocab-entry-confirmation"
          open={confirmDiaglogIsVisible}
          heading={<FormattedMessage id="stripes-core.button.deleteEntry" values={{ entry: type }} />}
          message={modalMessage}
          onConfirm={actuators.onDelete}
          onCancel={hideConfirmDialog}
          confirmLabel={<FormattedMessage id="stripes-core.button.delete" />}
        />
        { renderItemInUseDialog() }
        <Callout ref={(ref) => { calloutRef = ref; }} />
      </Pane>
    </Paneset>
  );
};


ControlledVocab.propTypes = {
  actionProps: PropTypes.object,
  actionSuppressor: PropTypes.object,
  actuatorType: PropTypes.string,
  baseUrl: PropTypes.string.isRequired,
  clientGeneratePk: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ]),
  columnMapping: PropTypes.object,
  editable: PropTypes.bool,
  formatter: PropTypes.object,
  hiddenFields: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string,
  itemTemplate: PropTypes.object,
  label: PropTypes.node.isRequired,
  labelSingular: PropTypes.node.isRequired,
  limitParam: PropTypes.string,
  listFormLabel: PropTypes.node,
  listSuppressor: PropTypes.func,
  listSuppressorText: PropTypes.node,
  nameKey: PropTypes.string,
  objectLabel: PropTypes.node.isRequired,
  parseRow: PropTypes.func,
  preCreateHook: PropTypes.func,
  preUpdateHook: PropTypes.func,
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
  records: PropTypes.string,
  rowFilter: PropTypes.element,
  rowFilterFunction: PropTypes.func,
  sortby: PropTypes.string,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired
  }).isRequired,
  /*
  * Allows for custom field validation. The function is called for each record (row) and should
  * return an empty object for no errors, or an object where the keys are the field names and
  * the values are the error message components/strings to display.
  * e.g., (item, index, items) => ({ name: item.name === 'Admin' ? 'Name cannot be admin' : undefined })
  */
  validate: PropTypes.func,
  visibleFields: PropTypes.arrayOf(PropTypes.string),
};

ControlledVocab.defaultProps = {
  visibleFields: ['name', 'description'],
  hiddenFields: [],
  readOnlyFields: [],
  columnMapping: {},
  itemTemplate: {},
  nameKey: undefined,
  formatter: {
    numberOfObjects: () => '-',
  },
  actionSuppressor: {
    edit: item => item.readOnly,
    delete: item => item.readOnly,
  },
  preCreateHook: (row) => row,
  preUpdateHook: (row) => row,
  sortby: 'name',
  validate: () => ({}),
  clientGeneratePk: true,
  editable: true,
  limitParam: 'limit',
  actuatorType: 'rest',
};


export default ControlledVocab;
