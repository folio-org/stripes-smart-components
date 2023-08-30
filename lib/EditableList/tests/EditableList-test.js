import React from 'react';
import { expect } from 'chai';
import { describe, beforeEach, it } from 'mocha';
import { spy } from 'sinon';

import { EditableList as ELInteractor, EditableListRow, converge, TextField } from '@folio/stripes-testing';

import TestForm from '../../../tests/TestForm';
import { setupApplication, mount } from '../../../tests/helpers';
import EditableList from '../EditableList';

const onStatusChange = spy();

describe('Editable List', () => {
  setupApplication();

  const list = ELInteractor();
  let createHandled = false;
  let updateHandled = false;
  let deleteHandled = false;

  beforeEach(async () => {
    onStatusChange.resetHistory();

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
          columnMapping={{}}
          visibleFields={['name']}
          nameKey="id"
          onUpdate={() => { updateHandled = true; }}
          onDelete={() => { deleteHandled = true; }}
          onCreate={() => { createHandled = true; }}
          onStatusChange={onStatusChange}
        />
      </TestForm>
    ));
  });

  it('renders the correct amount of items', () => list.has({ rowCount: 2 }));

  describe('clicking the delete button', () => {
    beforeEach(async () => {
      await EditableListRow().delete();
    });

    it('calls onDelete handler', () => converge(() => deleteHandled));

    it('should not call status change handler', () => {
      expect(onStatusChange.called).to.be.false;
    });
  });
  describe('clicking the add button', () => {
    beforeEach(async () => {
      await list.add();
    });

    it('adds a new item', () => list.has({ rowCount: 3 }));

    it('calls the update handler', () => converge(() => updateHandled));

    it('should call status change handler', () => {
      expect(onStatusChange.called).to.be.true;
    });

    describe('canceling', () => {
      beforeEach(async () => {
        await EditableListRow().cancel();
      });

      it('removes the form', () => TextField().absent());

      it('should call status change handler', () => {
        expect(onStatusChange.called).to.be.true;
      });
    });

    describe('saving', () => {
      beforeEach(async () => {
        await EditableListRow().save();
      });

      it('calls the create handler', () => converge(() => createHandled));
    });
  });
});
