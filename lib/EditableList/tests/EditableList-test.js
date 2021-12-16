import React from 'react';
import { describe, beforeEach, it } from 'mocha';
import { EditableList as ELInteractor } from '@folio/stripes-testing';

import TestForm from '../../../tests/TestForm';
import { setupApplication, mount } from '../../../tests/helpers';
import EditableList from '../EditableList';

describe.only('Editable List', () => {
  setupApplication();

  const list = ELInteractor();
  let createHandled = false;
  let updateHandled = false;
  let deleteHandled = false;
  beforeEach(async () => {
    const contentData = [
      {
        id: '1',
        name: 'Item 1',
      },
      {
        id: '2',
        name: 'Item 2',
      }
    ];
    createHandled = false;
    updateHandled = false;
    deleteHandled = false;
    await mount((
      <TestForm>
        <EditableList
          contentData={contentData}
          createButtonLabel="+ Add new"
          visibleFields={['name']}
          nameKey="id"
          onUpdate={() => { updateHandled = true; }}
          onDelete={() => { deleteHandled = true; }}
          onCreate={() => { createHandled = true; }}
        />
      </TestForm>
    ));
  });

  it('renders the correct amount of items', () => list.has({ rowCount: 2 }));
});
