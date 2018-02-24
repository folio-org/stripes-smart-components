import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap'; // eslint-disable-line
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Icon from '@folio/stripes-components/lib/Icon';
import Button from '@folio/stripes-components/lib/Button';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import NoteCreator from './NoteCreator';
import NotesForm from './NotesForm';
import css from './Notes.css';

class NoteRenderer extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    note: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    noteKey: PropTypes.string,
    highlighted: PropTypes.bool,
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

  handleClickDelete(data) {
    this.props.onDelete(data);
    this.setState({
      editMode: false,
      dropDownOpen: false,
    });
  }

  render() {
    const { note, noteKey, stripes } = this.props;

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
            <NotesForm form={`noteEdit-${noteKey}`} initialValues={note} textRows="4" editMode onCancel={this.handleFormCancel} onSubmit={this.handleFormSubmit} />
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
                <Button buttonStyle="link slim" title="Edit or delete this note" bsRole="toggle" >
                  <Icon icon="down-caret" color="rgba(150, 150, 150, .5)" />
                </Button>
                <DropdownMenu
                  bsRole="menu"
                  width="5em"
                  minWidth="5em"
                  aria-label="Edit or delete this note"
                  onToggle={this.onToggleDropDown}
                >
                  <IfPermission perm="notes.item.put">
                    <Button buttonStyle="marginBottom0 hover fullWidth" onClick={this.handleClickEdit}>Edit</Button>
                  </IfPermission>
                  <IfPermission perm="notes.item.delete">
                    <Button buttonStyle="marginBottom0 hover fullWidth" onClick={() => { this.handleClickDelete(noteKey); }}>Delete</Button>
                  </IfPermission>
                </DropdownMenu>
              </Dropdown>
            }
          </Col>
        </Row>
        <Row>
          <Col xs={12} >
            {note.text}
          </Col>
        </Row>
      </div>
    );
  }
}
export default NoteRenderer;
