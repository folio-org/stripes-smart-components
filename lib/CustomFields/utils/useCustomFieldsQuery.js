import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';

import {
  useStripes,
  useNamespace,
  useOkapiKy,
  useCallout,
} from '@folio/stripes-core';

import { selectModuleId } from '../selectors';
import { CUSTOM_FIELDS_SECTION_ID } from '../constants';

// max signed int value, specified in mod-customfields API documentation (STSMACOM-370)
const MAX_RECORDS = 2147483647;

// Module-level flag to prevent duplicate "missing attribute" error callouts across multiple hook instances
// This ensures only one error callout is shown during simultaneous renders, even when multiple
// components use this hook and encounter invalid custom fields at the same time
let isMissingAttributeErrorMessageVisible = false;
const MESSAGE_DISPLAY_DURATION = 6000; // Default callout timeout duration

/**
 * Mark the missing attribute error message as visible and schedule its reset
 * This prevents duplicate callouts during batch rendering but allows the error
 * to be shown again after the timeout expires
 */
const markMessageAsPending = () => {
  isMissingAttributeErrorMessageVisible = true;
  
  // Reset the flag after the callout timeout to allow the error to be shown again
  setTimeout(() => {
    isMissingAttributeErrorMessageVisible = false;
  }, MESSAGE_DISPLAY_DURATION);
};

/**
 * Custom hook for querying custom fields data.
 *
 * This hook fetches custom fields for a specific module and entity type,
 * filtering the results to only include fields that match the provided criteria.
 *
 * @param {Object} params - The parameters for the custom fields query
 * @param {string} params.moduleName - The name of the FOLIO module (e.g., 'users', 'Orders CRUD module')
 * @param {string} [params.entityType] - The type of entity to fetch custom fields for (e.g., 'user', 'purchase_order')
 * @param {string} [params.sectionId] - The section ID to filter custom fields by accordion display
 * @param {boolean} [params.isVisible] - Whether to filter for only visible custom fields
 *
 * @returns {Object} Query result object containing:
 * @returns {Array|null} returns.customFields - Array of custom field objects filtered by specified criteria, or null if no data
 * @returns {boolean} returns.isLoadingCustomFields - True while the query is loading
 * @returns {boolean} returns.isCustomFieldsError - True if an error occurred during the query
 * @returns {Function} returns.refetchCustomFields - Function to manually refetch the custom fields data
 *
 * @example
 * const {
 *   customFields,
 *   isLoadingCustomFields,
 *   isCustomFieldsError,
 *   refetchCustomFields,
 * } = useCustomFieldsQuery({
 *   moduleName: 'users',
 *   entityType: 'user',
 *   sectionId: 'custom-fields-section',
 *   isVisible: true,
 * });
 */
const useCustomFieldsQuery = ({
  moduleName,
  entityType,
  sectionId,
  isVisible,
}) => {
  const [namespace] = useNamespace({ key: 'customFields' });
  const { store: { getState } } = useStripes();
  const state = getState();
  const ky = useOkapiKy();
  const callout = useCallout();
  const intl = useIntl();

  const moduleId = useMemo(() => selectModuleId(state, moduleName), [state, moduleName]);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    [namespace, moduleId],
    async ({ signal }) => {
      const response = await ky.get('custom-fields', {
        searchParams: {
          limit: MAX_RECORDS,
        },
        signal,
        headers: {
          'x-okapi-module-id': moduleId,
        },
      }).json();

      return response?.customFields;
    },
    {
      enabled: moduleId !== undefined,
    }
  );

  // Validate that a custom field has a non-empty string `refId`.
  const isValidCustomField = (customField) => {
    return typeof customField.refId === 'string' && customField.refId?.trim()?.length;
  };

  const customFields = useMemo(() => {
    if (!data) return null;

    let fields = data.filter(customField => {
      const isValid = isValidCustomField(customField);

      if (!isValid) {
        // Only show the callout for the first invalid field encountered
        // This prevents duplicate warnings when multiple components render simultaneously
        if (!isMissingAttributeErrorMessageVisible) {
          markMessageAsPending();

          callout.sendCallout({
            timeout: MESSAGE_DISPLAY_DURATION,
            type: 'warning',
            message: intl.formatMessage({ id: 'stripes-smart-components.customFields.warning.missingAttribute' }, { name: customField.name }),
          });
        }
      }
      return isValid;
    });

    if (entityType) {
      fields = fields.filter(customField => customField.entityType === entityType);
    }

    if (sectionId) {
      fields = fields.filter(customField => {
        const hasSectionMatch = customField.displayInAccordion === sectionId;

        return sectionId === CUSTOM_FIELDS_SECTION_ID
          // consider empty `displayInAccordion` to support old custom fields
          ? !customField.displayInAccordion || hasSectionMatch
          : hasSectionMatch;
      });
    }

    if (isVisible) {
      fields = fields.filter(customField => customField.visible);
    }

    return fields;
  }, [data, entityType, sectionId, isVisible, callout, intl]);

  return {
    customFields,
    isLoadingCustomFields: isLoading,
    isCustomFieldsError: isError,
    refetchCustomFields: refetch,
  };
};

export default useCustomFieldsQuery;
