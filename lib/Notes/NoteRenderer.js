import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  DropdownMenu,
  Icon,
  IfPermission,
  Row
} from '@folio/stripes-components';
import NoteCreator from './NoteCreator';
import NotesForm from './NotesForm';
import css from './Notes.css';

class NoteRenderer extends React.Component {
  static propTypes = {
    highlighted: PropTypes.bool,
    note: PropTypes.object,
    noteKey: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    stripes: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      dropDownOpen: false,
      editMode: false,
    };

    this.onToggleDropDown = this.onToggleDropDown.bind(this);
    this.handleClickEdit = this.handleClickEdit.bind(this);
    this.handleFormCancel = this.handleFormCancel.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.connectedNoteCreator = props.stripes.connect(NoteCreator, { dataKey: props.note.id });
  }

  onToggleDropDown() {
    this.setState((curState) => {
      const toggled = !curState.dropDownOpen;
      return { dropDownOpen: toggled };
    });
  }

  handleClickDelete(data) {
    this.props.onDelete(data);
    this.setState({
      editMode: false,
      dropDownOpen: false,
    });
  }

  handleClickEdit() {
    this.setState({ editMode: true });
  }

  handleFormCancel() {
    this.setState({
      editMode: false,
      dropDownOpen: false,
    });
  }

  handleFormSubmit(data) {
    this.props.onUpdate(data);
    this.setState({
      editMode: false,
      dropDownOpen: false,
    });
  }

  render() {
    const { note, noteKey, stripes } = this.props;
    const formatMsg = stripes.intl.formatMessage;

    const stamp = new Date(Date.parse(note.metadata.createdDate)).toLocaleString(stripes.locale);

    if (this.state.editMode) {
      return (
        <IfPermission perm="notes.item.put">
          <div key={`notes-${noteKey}`} className={`${css.noteWell} ${css.editing}`}>
            <Row middle="xs">
              <Col xs={10}>
                <div className={css.byLine}>{stamp}</div>
                <this.connectedNoteCreator dataKey={note.metadata.createdByUserId} id={note.metadata.createdByUserId} />
              </Col>
            </Row>
            <NotesForm
              form={`noteEdit-${noteKey}`}
              initialValues={note}
              textRows="4"
              editMode
              onCancel={this.handleFormCancel}
              onSubmit={this.handleFormSubmit}
            />
          </div>
        </IfPermission>
      );
    }

    const canEditOrDelete = stripes.hasPerm('notes.item.put') || stripes.hasPerm('notes.item.delete');
    const highlighted = this.props.highlighted ? css.highlighted : '';

    return (
      <div key={`notes-${noteKey}`} className={`${css.noteWell} ${highlighted}`}>
        <Row middle="xs">
          <Col xs={10}>
            <div className={css.byLine}>{stamp}</div>
            <this.connectedNoteCreator dataKey={note.metadata.createdByUserId} id={note.metadata.createdByUserId} />
          </Col>
          <Col xs={2}>
            {canEditOrDelete &&
              <Dropdown
                id={`edit-delete-dropdown-${noteKey}`}
                style={{ float: 'right' }}
                pullRight
                open={this.state.dropDownOpen}
                onToggle={this.onToggleDropDown}
              >
                <Button
                  buttonStyle="link slim"
                  aria-label={formatMsg({ id: 'stripes-smart-components.editOrDeleteNote' })}
                  bsRole="toggle"
                >
                  <Icon icon="down-caret" color="rgba(150, 150, 150, .5)" />
                </Button>
                <DropdownMenu
                  bsRole="menu"
                  width="5em"
                  minWidth="5em"
                  aria-label={formatMsg({ id: 'stripes-smart-components.editOrDeleteNote' })}
                  onToggle={this.onToggleDropDown}
                >
                  <IfPermission perm="notes.item.put">
                    <Button buttonStyle="marginBottom0 hover fullWidth" onClick={this.handleClickEdit}>
                      <FormattedMessage id="stripes-components.button.edit" />
                    </Button>
                  </IfPermission>
                  <IfPermission perm="notes.item.delete">
                    <Button
                      buttonStyle="marginBottom0 hover fullWidth"
                      onClick={() => { this.handleClickDelete(noteKey); }}
                    >
                      <FormattedMessage id="stripes-components.button.delete" />
                    </Button>
                  </IfPermission>
                </DropdownMenu>
              </Dropdown>
            }
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {note.text}
          </Col>
        </Row>
      </div>
    );
  }
}
export default NoteRenderer;
