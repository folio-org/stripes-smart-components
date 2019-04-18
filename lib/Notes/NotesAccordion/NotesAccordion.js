import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Accordion,
  Headline,
  Badge,
  Button,
} from '@folio/stripes-components';

import NotesList from './components';
import styles from './NotesAccordion.css';

const defaultColumnsConfig = [
  {
    name: 'date',
    title: <FormattedMessage id="stripes-smart-components.date" />,
    width: '30%',
  },
  {
    name: 'updatedBy',
    title: <FormattedMessage id="stripes-smart-components.updatedBy" />,
    width: '30%',
  },
  {
    name: 'title',
    title: <FormattedMessage id="stripes-smart-components.title" />,
    width: '40%',
  },
];

export const columnShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  width: PropTypes.string,
});

export const noteShape = PropTypes.shape({
  id: PropTypes.string,
  lastSavedDate: PropTypes.instanceOf(Date),
  lastSavedUserFullName: PropTypes.string,
  title: PropTypes.string,
});

export class NotesAccordion extends Component {
  static propTypes = {
    columnsConfig: PropTypes.arrayOf(columnShape),
    notes: PropTypes.arrayOf(noteShape),
    onCreate: PropTypes.func.isRequired,
    onNoteClick: PropTypes.func.isRequired,
    open: PropTypes.bool,
  }

  static defaultProps = {
    notes: [],
  }

  constructor(props) {
    super(props);

    this.columnsConfig = Array.isArray(props.columnsConfig)
      ? props.columnsConfig
      : defaultColumnsConfig;
  }

  renderHeader = () => {
    return (
      <Headline
        data-test-notes-accordion-header
        size="large"
        tag="h3"
      >
        <FormattedMessage id="stripes-smart-components.notes" />
      </Headline>
    );
  }

  renderHeaderButtons() {
    const {
      onCreate,
    } = this.props;

    return (
      <Fragment>
        <Button data-test-notes-accordion-add-button>
          <FormattedMessage id="stripes-smart-components.add" />
        </Button>
        <Button
          data-test-notes-accordion-new-button
          buttonClass={styles['new-button']}
          onClick={onCreate}
        >
          <FormattedMessage id="stripes-smart-components.new" />
        </Button>
      </Fragment>
    );
  }

  renderQuantityIndicator() {
    return (
      <Badge>
        <span data-test-notes-accordion-quantity-indicator>
          {this.props.notes.length}
        </span>
      </Badge>
    );
  }

  render() {
    const {
      open,
      notes,
      onNoteClick,
    } = this.props;

    return (
      <Accordion
        id="notes-accordion"
        open={open}
        label={this.renderHeader()}
        displayWhenClosed={this.renderQuantityIndicator()}
        displayWhenOpen={this.renderHeaderButtons()}
      >
        <NotesList
          columnsConfig={this.columnsConfig}
          notes={notes}
          onNoteClick={onNoteClick}
        />
      </Accordion>
    );
  }
}
