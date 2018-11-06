import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import stripesForm from '@folio/stripes-form';
import { Button, TextArea } from '@folio/stripes-components';

class NotesForm extends React.Component {
  static propTypes = {
    editMode: PropTypes.bool,
    form: PropTypes.string,
    handleSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    pristine: PropTypes.bool,
    reset: PropTypes.func,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired
    }).isRequired,
    submitting: PropTypes.bool,
    textRows: PropTypes.string,
    values: PropTypes.object,
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
        <FormattedMessage id="stripes-smart-components.enterANote">
          {placeholder => (
            <FormattedMessage id="stripes-smart-components.notesTextArea">
              {ariaLabel => (
                <Field
                  name="text"
                  placeholder={placeholder}
                  aria-label={ariaLabel}
                  fullWidth
                  id="note_textarea"
                  component={TextArea}
                  onKeyDown={(e) => { handleKeyDown(e, handleClickSubmit); }}
                  rows={textRows}
                />
              )}
            </FormattedMessage>
          )}
        </FormattedMessage>
        <div style={{ textAlign: 'right' }}>
          {editMode &&
            <Button
              buttonStyle="hover"
              onClick={onCancel}
            >
              <FormattedMessage id="stripes-components.button.cancel" />
            </Button>
          }
          <FormattedMessage id="stripes-smart-components.postNote">
            {ariaLabel => (
              <Button
                disabled={pristine || submitting}
                onClick={handleClickSubmit}
                aria-label={ariaLabel}
              >
                <FormattedMessage id="stripes-smart-components.post" />
              </Button>
            )}
          </FormattedMessage>
        </div>
      </form>
    );
  }
}

export default stripesForm({
  form: 'NotesForm',
  enableReinitialize: true,
})(NotesForm);
