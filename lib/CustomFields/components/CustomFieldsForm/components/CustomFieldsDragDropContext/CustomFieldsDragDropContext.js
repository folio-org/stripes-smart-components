import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  injectIntl,
} from 'react-intl';

import {
  textboxShape,
  textareaShape,
  checkboxShape,
} from '../../../../shapes';

import styles from './CustomFieldsDragDropContext.css';

const propTypes = {
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
  onDragEnd: PropTypes.func.isRequired,
};

const CustomFieldsAccordions = ({
  fields,
  onDragEnd,
  intl,
  children,
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
        {children}
      </DragDropContext>
    </div>
  );
};

CustomFieldsAccordions.propTypes = propTypes;

export default injectIntl(CustomFieldsAccordions);
