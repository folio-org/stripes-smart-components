import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import stripesForm from '@folio/stripes-form';
import { Button, TextArea } from '@folio/stripes-components';

class NotesForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }),
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
    const formatMsg = this.props.stripes.intl.formatMessage;

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
          placeholder={formatMsg({ id: 'stripes-smart-components.enterANote' })}
          aria-label={formatMsg({ id: 'stripes-smart-components.notesTextArea' })}
          fullWidth
          id="note_textarea"
          component={TextArea}
          onKeyDown={(e) => { handleKeyDown(e, handleClickSubmit); }}
          rows={textRows}
        />
        <div style={{ textAlign: 'right' }}>
          {editMode &&
            <Button buttonStyle="hover" onClick={onCancel} aria-label={formatMsg({ id: 'stripes-smart-components.cancelEdit' })}>
              <FormattedMessage id="stripes-components.button.cancel" />
            </Button>
          }
          <Button disabled={pristine || submitting} onClick={handleClickSubmit} aria-label={formatMsg({ id: 'stripes-smart-components.postNote' })}>
            <FormattedMessage id="stripes-smart-components.post" />
          </Button>
        </div>
      </form>
    );
  }
}

export default stripesForm({
  form: 'NotesForm',
  enableReinitialize: true,
})(NotesForm);
