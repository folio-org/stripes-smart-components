import PropTypes from 'prop-types';
import { noop } from 'lodash';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import { Pluggable } from '@folio/stripes-core';
import {
  IconButton,
  Label,
  TextField,
} from '@folio/stripes-components';

import {
  getLookupAdapter,
  unwrapSelectedRecord,
} from '../../lookup';
// Imported directly rather than through `utils/index` to keep this file out of the
// import cycle that `constants.js` would otherwise form via `fieldComponents`.
import useLookupRecord from '../../utils/useLookupRecord';

const propTypes = {
  disabled: PropTypes.bool,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  label: PropTypes.node,
  meta: PropTypes.object,
  refEntityType: PropTypes.string,
  required: PropTypes.bool,
};

/**
 * Edit control for a lookup custom field, shaped like the vendor field in
 * stripes-acq-components: a disabled text box showing the resolved name, with the
 * finder plugin below it. The name is never editable by hand, since typing over it
 * would leave the stored reference pointing somewhere else.
 */
const LookupField = ({
  input,
  meta = {},
  label,
  refEntityType,
  required = false,
  disabled = false,
}) => {
  const intl = useIntl();
  const adapter = getLookupAdapter(refEntityType);
  const referenceId = input.value;

  const {
    label: recordLabel,
    isLoadingRecord,
    messageId,
    cacheRecord,
  } = useLookupRecord({ refEntityType, id: referenceId });

  if (!adapter) {
    return (
      <div>
        <Label required={required}>{label}</Label>
        <FormattedMessage
          id={messageId}
          values={{ refEntityType }}
        />
      </div>
    );
  }

  // A deleted record and one the user may not read both belong in the box, the way
  // FieldOrganization puts its "invalid reference" text there.
  const getDisplayValue = () => {
    if (!referenceId || isLoadingRecord) return '';

    if (messageId) {
      return intl.formatMessage({ id: messageId }, { id: referenceId, refEntityType });
    }

    return recordLabel;
  };

  // The plugin hands over the whole record; caching it spares the request that
  // resolving the new id would otherwise make right away.
  const handleSelect = (selection) => {
    const record = unwrapSelectedRecord(selection);

    if (!record?.id) return;

    cacheRecord(record);
    input.onChange(record.id);
  };

  // `undefined` rather than an empty string: the key has to disappear from
  // `customFields`, or the backend rejects the value for not being a UUID.
  const handleClear = () => {
    input.onChange(undefined);
  };

  const clearButton = (referenceId && !disabled)
    ? (
      <IconButton
        icon="times-circle-solid"
        size="small"
        onClick={handleClear}
        ariaLabel={intl.formatMessage({ id: 'stripes-smart-components.customFields.lookup.clear' })}
        data-test-lookup-clear
      />
    )
    : null;

  return (
    <div data-test-lookup-field>
      <TextField
        id={input.name}
        input={{ ...input, value: getDisplayValue(), onChange: noop }}
        meta={meta}
        label={label}
        required={required}
        disabled
        fullWidth
        hasClearIcon={false}
        endControl={clearButton}
      />

      {!disabled && (
        <div>
          <Pluggable
            aria-haspopup="true"
            dataKey={refEntityType}
            id={`${input.name}-plugin`}
            searchButtonStyle="link"
            searchLabel={<FormattedMessage id={adapter.searchLabelId} />}
            type={adapter.pluginType}
            {...{ [adapter.selectProp]: handleSelect }}
          >
            <FormattedMessage id="stripes-smart-components.customFields.lookup.noPlugin" />
          </Pluggable>
        </div>
      )}
    </div>
  );
};

LookupField.propTypes = propTypes;

export default LookupField;
