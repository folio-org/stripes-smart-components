import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  injectIntl,
  intlShape,
} from 'react-intl';
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
import { fieldTypes } from '../../../../constants';

import styles from './CustomFieldsAccordions.css';

const propTypes = {
  accordions: PropTypes.object.isRequired,
  changeFieldValue: PropTypes.func.isRequired,
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
  getFormState: PropTypes.func.isRequired,
  intl: intlShape,
  onDeleteClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onToggleAccordion: PropTypes.func.isRequired,
  permissions: permissionsShape.isRequired,
};

const CustomFieldsAccordions = ({
  fields,
  permissions,
  accordions,
  onToggleAccordion,
  onDragEnd,
  onDeleteClick,
  changeFieldValue,
  getFormState,
  intl,
}) => {
  const getCustomFieldNameById = (id) => {
    const customField = fields.value.find(cf => cf.id === id);
    if (!customField) {
      return '';
    }

    return customField.values.name;
  };

  const onDragStart = (start, provided) => {
    provided.announce(intl.formatMessage({
      id: 'stripes-smart-components.customFields.dragDrop.lifted',
    }, {
      name: getCustomFieldNameById(start.draggableId),
      position: start.source.index + 1,
    }));
  };

  const onDragUpdate = (update, provided) => {
    const message = update.destination
      ? intl.formatMessage({
        id: 'stripes-smart-components.customFields.dragDrop.moving',
      }, {
        name: getCustomFieldNameById(update.draggableId),
        position: update.destination.index + 1,
      })
      : intl.formatMessage({
        id: 'stripes-smart-components.customFields.dragDrop.notOverDroppable',
      });

    provided.announce(message);
  };

  const handleDragEnd = (result, provided) => {
    const name = getCustomFieldNameById(result.draggableId);

    const message = result.destination
      ? intl.formatMessage({
        id: 'stripes-smart-components.customFields.dragDrop.moved',
      }, {
        name,
        start: result.source.index + 1,
        end: result.destination.index + 1,
      })
      : intl.formatMessage({
        id: 'stripes-smart-components.customFields.dragDrop.returned',
      }, {
        name,
        position: result.source.index + 1,
      });

    provided.announce(message);

    onDragEnd(result, provided);
  };

  return (
    <div className={styles.accordionsWrapper}>
      <DragDropContext
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={handleDragEnd}
      >
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
                {fields.map((name, index) => {
                  const isDragDisabled = fields.length < 2;
                  const { id } = fields.value[index];
                  const fieldType = fields.value[index].values.type;

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
                  };

                  const selectField = getFormState().values.customFields[index].values.selectField;

                  if (fieldType === fieldTypes.RADIO_BUTTON_SET || fieldType === fieldTypes.SELECT) {
                    accordionProps.defaultOptions = selectField.defaults;
                  }

                  if (fieldType === fieldTypes.MULTISELECT) {
                    accordionProps.defaultOptions = selectField.defaults
                      .reduce((acc, option) => {
                        if (!selectField.options.values.includes(option)) {
                          return acc;
                        }

                        return option && Array.isArray(option) ? [...acc, ...option] : [...acc, option];
                      }, []);
                  }

                  return (
                    <Draggable
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
                })}
                {droppableProvided.placeholder}
              </AccordionSet>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

CustomFieldsAccordions.propTypes = propTypes;

export default injectIntl(CustomFieldsAccordions);
