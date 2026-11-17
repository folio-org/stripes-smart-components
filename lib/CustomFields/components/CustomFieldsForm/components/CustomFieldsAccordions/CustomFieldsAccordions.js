import React from 'react';
import PropTypes from 'prop-types';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import {
  AccordionSet,
} from '@folio/stripes-components';

import DraggableFieldAccordion from '../../../DraggableFieldAccordion';
import {
  textboxShape,
  textareaShape,
  checkboxShape,
  permissionsShape,
} from '../../../../shapes';

import {
  fieldTypes,
  fieldTypesWithOptions,
} from '../../../../constants';

const propTypes = {
  accordions: PropTypes.object.isRequired,
  changeFieldValue: PropTypes.func.isRequired,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
  fieldOptionsStats: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  fields: PropTypes.shape({
    length: PropTypes.number.isRequired,
    map: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    value: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      values: PropTypes.oneOfType([
        textboxShape,
        textareaShape,
        checkboxShape,
      ]).isRequired,
    })).isRequired,
  }).isRequired,
  hasDisplayInAccordionField: PropTypes.bool,
  lastAddedAccordionId: PropTypes.string.isRequired,
  lookupStatsLoaded: PropTypes.bool.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onOptionDelete: PropTypes.func.isRequired,
  onToggleAccordion: PropTypes.func.isRequired,
  optionsStatsLoaded: PropTypes.bool.isRequired,
  permissions: permissionsShape.isRequired,
  usedLookupFieldIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const CustomFieldsAccordions = ({
  fields,
  permissions,
  accordions,
  onToggleAccordion,
  onDeleteClick,
  changeFieldValue,
  optionsStatsLoaded,
  fieldOptionsStats,
  usedLookupFieldIds,
  lookupStatsLoaded,
  onOptionDelete,
  lastAddedAccordionId,
  hasDisplayInAccordionField,
  displayInAccordionOptions,
}) => {
  const renderAccordions = () => {
    return fields.map((name, index) => {
      const isDragDisabled = fields.length < 2;
      const { id } = fields.value[index];

      const accordionProps = {
        fieldNamePrefix: `${name}.values`,
        id,
        key: id,
        deleteCustomField: () => {
          fields.remove(index);
          onDeleteClick(fields.value[index], index);
        },
        isEditMode: true,
        fieldData: { ...fields.value[index].values },
        changeFieldValue,
        permissions,
        index,
        isDragDisabled,
        lastAddedAccordionId,
        hasDisplayInAccordionField,
        ...(hasDisplayInAccordionField && { displayInAccordionOptions }),
      };

      if (fieldTypesWithOptions.includes(fields.value[index].values.type)) {
        accordionProps.optionsStatsLoaded = optionsStatsLoaded;
        accordionProps.onOptionDelete = onOptionDelete;

        if (optionsStatsLoaded) {
          if (id in fieldOptionsStats) {
            accordionProps.usedOptions = fieldOptionsStats[id];
          } else {
            accordionProps.usedOptions = [];
          }
        }
      }

      if (fields.value[index].values.type === fieldTypes.LOOKUP) {
        // Unsaved fields have no records referring to them yet. For saved ones, stay locked
        // while the usage statistics are pending or failed, so the target is never released
        // on incomplete data.
        const isInUse = usedLookupFieldIds.includes(id);

        accordionProps.isRefEntityTypeInUse = isInUse;
        accordionProps.isRefEntityTypeLocked = !id.startsWith('unsaved_')
          && (!lookupStatsLoaded || isInUse);
      }

      return (
        <Draggable
          key={id}
          draggableId={id}
          index={index}
          disableInteractiveElementBlocking={!accordions[id]}
          isDragDisabled={isDragDisabled}
        >
          {(draggableProvided, snapshot) => (
            <DraggableFieldAccordion
              {...accordionProps}
              provided={draggableProvided}
              snapshot={snapshot}
            />
          )}
        </Draggable>
      );
    });
  };

  return (
    <Droppable droppableId="custom-fields-droppable">
      {(droppableProvided) => (
        <div
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
        >
          <AccordionSet
            accordionStatus={accordions}
            onToggle={onToggleAccordion}
          >
            {renderAccordions()}
            {droppableProvided.placeholder}
          </AccordionSet>
        </div>
      )}
    </Droppable>
  );
};

CustomFieldsAccordions.propTypes = propTypes;

export default CustomFieldsAccordions;
