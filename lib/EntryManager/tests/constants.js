import React from 'react';
import PropTypes from 'prop-types';
import connectStripes from '../../../tests/connectStripes';
import EntryManager from '../EntryManager';

export const ConnectedComponent = connectStripes(EntryManager);
export const detailComponent = () => <div data-test-detail-section>detailComponent</div>;
export const entryLabel = <div>entryLabel</div>;
export const entryList = [
  {
    id: 1,
    name: 'test',
    test: 'test',
  },
  {
    id: 2,
    name: 'test1',
    test: 'test1',
  },
  {
    id: 3,
    name: 'test2',
    test: 'test2',
  },
];

export const prohibitItemDelete = {
  close: 'close',
  label: 'label',
  message: 'message',
};

export const permissions = {
  put: 'test',
  post: 'test',
  delete: 'test',
};
const entryFormComponent = ({ onSave }) => {
  return (
    <div data-test-entry-form>
      entryFormComponent
      <button
        data-test-entry-form-save
        type="submit"
        onClick={() => { onSave({}); }}
      >
        Save
      </button>
    </div>
  );
};
entryFormComponent.propTypes = {
  onSave: PropTypes.func.isRequired,
};
export const paneTitle = <div>paneTitle</div>;
export const isEntryInUse = () => true;

export { entryFormComponent };
