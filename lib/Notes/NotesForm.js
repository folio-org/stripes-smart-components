import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import stripesForm from '@folio/stripes-form';
import Button from '@folio/stripes-components/lib/Button';
import AtMentionTextArea from './AtMentionTextArea';

class NotesForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    editMode: PropTypes.bool,
    onCancel: PropTypes.func,
    textRows: PropTypes.string,
    form: PropTypes.string,
    handleSubmit: PropTypes.func,
    reset: PropTypes.func,
    submitting: PropTypes.bool,
    values: PropTypes.object,
    pristine: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.connectedAtMentionTextArea = props.stripes.connect(AtMentionTextArea);
  }

  render() {
    const {
      form,
      handleSubmit,
      pristine,
      submitting,
      textRows,
      editMode,
      onCancel,
    } = this.props;

    const handleKeyDown = (e, handler) => {
      if (e.key === 'Enter' && e.shiftKey === false) {
        e.preventDefault();
        handler(this.props.values);
      }
    };

    const handleClickSubmit = () => {
      handleSubmit();
      this.props.reset();
    };

    return (
      <form>
        <Field
          name="text"
          placeholder="Enter a note."
          aria-label="Note Textarea"
          fullWidth
          id="note_textarea"
          component={this.connectedAtMentionTextArea}
          onKeyDown={(e) => { handleKeyDown(e, handleClickSubmit); }}
          rows={textRows}
        />
        <div style={{ textAlign: 'right' }}>
          {editMode &&
            <Button buttonStyle="hover" onClick={onCancel} title="Cancel Edit">Cancel</Button>
          }
          <Button disabled={pristine || submitting} onClick={handleClickSubmit} title="Post Note">Post</Button>
        </div>
      </form>
    );
  }
}

export default stripesForm({
  form: 'NotesForm',
  enableReinitialize: true,
})(NotesForm);
