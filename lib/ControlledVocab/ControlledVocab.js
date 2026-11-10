import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { uniqueId, pickBy } from 'lodash';

import {
  Button,
  Callout,
  Col,
  ConfirmationModal,
  IconButton,
  Loading,
  Modal,
  ModalFooter,
  MultiColumnList,
  NoValue,
  Pane,
  Paneset,
  Row,
  TextField,
} from '@folio/stripes-components';

import useControlledVocab from './useControlledVocab';
import css from './ControlledVocab.css';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
const NEW_ROW_ID = '__new__';
const ACTIONS = {
  CREATE: 'termCreated',
  EDIT: 'termUpdated',
  DELETE: 'termDeleted',
};

const ControlledVocab = ({
  actionProps,
  actionSuppressor = {
    edit: item => item.readOnly,
    delete: item => item.readOnly,
  },
  actuatorType = 'rest',
  baseUrl,
  canCreate = true,
  clientGeneratePk = true,
  columnMapping = {},
  dismissPane,
  editable = true,
  formatter = { numberOfObjects: () => <NoValue /> },
  hiddenFields = [],
  hideCreateButton = false,
  id,
  itemTemplate = {},
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
  readOnlyFields = [],
  records,
  rowFilter,
  rowFilterFunction,
  sortby,
  tenant,
  translations = {},
  validate = () => ({}),
  visibleFields = ['name', 'description'],
  ...rest
}) => {
  const [paneId] = useState(() => id || uniqueId('controlled-vocab-'));
  const callout = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [errors, setErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const [showInUse, setShowInUse] = useState(false);

  const {
    values,
    updaters,
    isLoading,
    isSaving,
    isDeleting,
    createItem,
    updateItem,
    deleteItem,
  } = useControlledVocab({
    baseUrl,
    records,
    sortby,
    limitParam,
    tenant,
    clientGeneratePk,
    actuatorType,
    preCreateHook,
    preUpdateHook,
  });

  const primaryField = visibleFields[0];

  const sendCallout = (item, action) => {
    const translation = translations[action];
    const term = item[primaryField];
    const message = translation ?
      <FormattedMessage id={translation} values={{ term }} /> :
      <FormattedMessage
        id={`stripes-smart-components.cv.${action}`}
        values={{ type: labelSingular, term }}
      />;

    callout.current?.sendCallout({ message });
  };

  const stopEditing = () => {
    setEditingId(null);
    setDraft({});
    setErrors({});
  };

  const startCreate = () => {
    setEditingId(NEW_ROW_ID);
    setDraft({ ...itemTemplate });
    setErrors({});
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({ ...item });
    setErrors({});
  };

  const save = async () => {
    const foundErrors = { ...(validate(draft, 0, [draft])) };
    if (!draft[primaryField]?.trim()) {
      foundErrors[primaryField] = <FormattedMessage id="stripes-core.label.missingRequiredField" />;
    }

    if (Object.keys(foundErrors).length) {
      setErrors(foundErrors);
      return;
    }

    // trim whitespace
    visibleFields.forEach(field => {
      draft[field] = draft[field].trim();
    });

    const isNew = editingId === NEW_ROW_ID;
    try {
      await (isNew ? createItem(draft) : updateItem(draft));
      sendCallout(draft, isNew ? ACTIONS.CREATE : ACTIONS.EDIT);
      stopEditing();
    } catch (e) {
      console.warn({ ERROR: e });
      // show an error message, then leave the row open to allow a retry
      const text = await e.response?.text();
      let message = text;
      try {
        message = JSON.parse(text)?.errors[0]?.message;
      } catch { };
      callout.current?.sendCallout({
        type: 'error',
        timeout: 0,
        message: [
          <FormattedMessage
            key="error"
            id="stripes-smart-components.cv.saveFailed"
            values={{ type: labelSingular, term: draft[primaryField] }}
          />,
          <div key="message">{message}</div>
        ],
      });
    }
  };

  const confirmDelete = async () => {
    const item = toDelete;

    try {
      await deleteItem(item);
      sendCallout(item, ACTIONS.DELETE);
    } catch (e) {
      // the usual cause is a referential constraint violation from a value
      // that is still in use, but this is just a guess
      console.warn(e);
      setShowInUse(true);
    } finally {
      setToDelete(null);
    }
  };

  const renderLastUpdated = (metadata) => {
    const record = updaters.find(r => r.id === metadata.updatedByUserId);
    let user;

    if (record?.personal) {
      const { firstName, lastName = '' } = record.personal;
      const name = firstName ? `${lastName}, ${firstName}` : lastName;
      user = <Link to={`/users/view/${metadata.updatedByUserId}`}>{name}</Link>;
    } else if (metadata.updatedByUserId === SYSTEM_USER_ID || !metadata.updatedByUserId) {
      user = <FormattedMessage id="stripes-smart-components.system" />;
    } else {
      user = <FormattedMessage id="stripes-components.metaSection.unknownUser" />;
    }

    return (
      <div className={css.lastUpdated}>
        <FormattedMessage
          id="stripes-smart-components.cv.updatedAtAndBy"
          values={{ date: <FormattedDate value={metadata.updatedDate} />, user }}
        />
      </div>
    );
  };

  const rows = (() => {
    const filtered = rowFilterFunction ? values.filter(rowFilterFunction) : values;
    const parsed = parseRow ? filtered.map(parseRow) : filtered;
    return editingId === NEW_ROW_ID ? [{ ...draft, id: NEW_ROW_ID }, ...parsed] : parsed;
  })();

  const columns = [
    ...visibleFields,
    'lastUpdated',
    'numberOfObjects',
  ].filter(field => !hiddenFields.includes(field));

  const readOnly = new Set([...readOnlyFields, 'lastUpdated', 'numberOfObjects']);

  const fieldFormatters = Object.fromEntries(columns.map(field => [field, (item) => {
    if (item.id === editingId && !readOnly.has(field)) {
      return (
        <TextField
          aria-label={`${columnMapping[field] ?? field}`}
          data-testid={`field-${field}`}
          marginBottom0
          fullWidth
          autoFocus={field === primaryField}
          placeholder={field}
          value={draft[field] ?? ''}
          error={errors[field]}
          onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))}
        />
      );
    }
    return item[field];
  }]));

  const formatters = {
    ...fieldFormatters,
    lastUpdated: item => (item.metadata ? renderLastUpdated(item.metadata) : <NoValue />),
    ...formatter,
    actions: (item) => {
      if (item.id === editingId) {
        return (
          <>
            <Button marginBottom0 disabled={isSaving} onClick={stopEditing}>
              <FormattedMessage id="stripes-core.button.cancel" />
            </Button>
            <Button marginBottom0 buttonStyle="primary" disabled={isSaving} onClick={save}>
              <FormattedMessage id="stripes-core.button.save" />
            </Button>
          </>
        );
      }

      if (!editable || editingId) return null;

      return (
        <>
          {!actionSuppressor.edit(item) &&
            <IconButton
              icon="edit"
              data-testid={`edit-${item.id}`}
              onClick={() => startEdit(item)}
              {...actionProps?.edit?.({ item })}
            />}
          {!actionSuppressor.delete(item) &&
            <IconButton
              icon="trash"
              data-testid={`delete-${item.id}`}
              disabled={isDeleting}
              onClick={() => setToDelete(item)}
              {...actionProps?.delete?.({ item })}
            />}
        </>
      );
    }
  };

  const mapping = {
    name: labelSingular,
    lastUpdated: <FormattedMessage id="stripes-smart-components.cv.lastUpdated" />,
    numberOfObjects: (
      <FormattedMessage
        id="stripes-smart-components.cv.numberOfObjects"
        values={{ objects: objectLabel }}
      />
    ),
    actions: <FormattedMessage id="stripes-smart-components.editableList.actionsColumnHeader" />,
    ...columnMapping,
  };

  const type = labelSingular;
  const hideList = listSuppressor?.();
  const dataProps = pickBy(rest, (_, key) => key.startsWith('data-test'));

  return (
    <Paneset id={paneId} {...dataProps}>
      <Pane
        defaultWidth="fill"
        fluidContentWidth
        paneTitle={label}
        id="controlled-vocab-pane"
        dismissible={!!dismissPane}
        onClose={dismissPane}
      >
        {rowFilter}
        {hideList && listSuppressorText && <div>{listSuppressorText}</div>}
        {!hideList &&
          <>
            <Row between="xs">
              <Col xs><h3>{listFormLabel || label}</h3></Col>
              {canCreate && !hideCreateButton && editable &&
                <Col xs>
                  <Button disabled={!!editingId} onClick={startCreate}>
                    <FormattedMessage id="stripes-core.button.new" />
                  </Button>
                </Col>}
            </Row>
            <MultiColumnList
              id={`${paneId}-list`}
              contentData={rows}
              totalCount={rows.length}
              visibleColumns={[...columns, 'actions']}
              columnMapping={mapping}
              formatter={formatters}
              isEmptyMessage={isLoading ?
                <Loading /> :
                <FormattedMessage id="stripes-smart-components.cv.noExistingTerms" values={{ terms: label }} />}
              interactive={false}
            />
          </>}
        <ConfirmationModal
          id="delete-controlled-vocab-entry-confirmation"
          open={!!toDelete}
          heading={translations.deleteEntry ?
            <FormattedMessage id={translations.deleteEntry} /> :
            <FormattedMessage id="stripes-core.button.deleteEntry" values={{ entry: type }} />}
          message={translations.termWillBeDeleted ?
            <FormattedMessage id={translations.termWillBeDeleted} values={{ term: toDelete?.[primaryField] }} /> :
            <FormattedMessage
              id="stripes-smart-components.cv.termWillBeDeleted"
              values={{ type, term: toDelete?.[primaryField] }}
            />}
          isConfirmButtonDisabled={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          confirmLabel={<FormattedMessage id="stripes-core.button.delete" />}
        />
        <Modal
          open={showInUse}
          size="small"
          label={translations.cannotDeleteTermHeader ?
            <FormattedMessage id={translations.cannotDeleteTermHeader} /> :
            <FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermHeader" values={{ type }} />}
          footer={
            <ModalFooter>
              <Button buttonStyle="primary" marginBottom0 onClick={() => setShowInUse(false)}>
                <FormattedMessage id="stripes-core.label.okay" />
              </Button>
            </ModalFooter>
          }
        >
          {translations.cannotDeleteTermMessage ?
            <FormattedMessage id={translations.cannotDeleteTermMessage} /> :
            <FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermMessage" values={{ type }} />}
        </Modal>
        <Callout ref={callout} />
      </Pane>
    </Paneset>
  );
};

ControlledVocab.propTypes = {
  actionProps: PropTypes.object,
  actionSuppressor: PropTypes.shape({ edit: PropTypes.func, delete: PropTypes.func }),
  actuatorType: PropTypes.oneOf(['rest', 'refdata']),
  baseUrl: PropTypes.string.isRequired,
  canCreate: PropTypes.bool,
  clientGeneratePk: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  columnMapping: PropTypes.object,
  dismissPane: PropTypes.func,
  editable: PropTypes.bool,
  formatter: PropTypes.object,
  hiddenFields: PropTypes.arrayOf(PropTypes.string),
  hideCreateButton: PropTypes.bool,
  id: PropTypes.string,
  itemTemplate: PropTypes.object,
  label: PropTypes.node.isRequired,
  labelSingular: PropTypes.node,
  limitParam: PropTypes.string,
  listFormLabel: PropTypes.node,
  listSuppressor: PropTypes.func,
  listSuppressorText: PropTypes.node,
  objectLabel: PropTypes.node.isRequired,
  parseRow: PropTypes.func,
  preCreateHook: PropTypes.func,
  preUpdateHook: PropTypes.func,
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
  records: PropTypes.string,
  rowFilter: PropTypes.element,
  rowFilterFunction: PropTypes.func,
  sortby: PropTypes.string,
  tenant: PropTypes.string,
  translations: PropTypes.shape({
    cannotDeleteTermHeader: PropTypes.string,
    cannotDeleteTermMessage: PropTypes.string,
    deleteEntry: PropTypes.string,
    termCreated: PropTypes.string,
    termDeleted: PropTypes.string,
    termUpdated: PropTypes.string,
    termWillBeDeleted: PropTypes.string,
  }),
  validate: PropTypes.func,
  visibleFields: PropTypes.arrayOf(PropTypes.string),
};

export default ControlledVocab;
