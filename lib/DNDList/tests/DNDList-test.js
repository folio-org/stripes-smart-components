import React from 'react';
import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { mount, setupApplication } from '../../../tests/helpers';

import DNDList from '../DNDList';
import DNDListInteractor from './interactor';

describe('DNDList', () => {
  setupApplication();

  const dndList = new DNDListInteractor();
  const onDragEndFake = sinon.fake();
  const onDragStartFake = sinon.fake();
  const onDragUpdateFake = sinon.fake();

  beforeEach(async () => {
    await mount(
      <>
        <div id="ModuleContainer" />
        <DNDList
          onDragEnd={onDragEndFake}
          onDragStart={onDragStartFake}
          onDragUpdate={onDragUpdateFake}
          contentData={[
            {
              id: '0',
              index: 0,
            },
            {
              id: '1',
              index: 1,
            }
          ]}
        />
      </>
    );

    onDragEndFake.resetHistory();
    onDragStartFake.resetHistory();
    onDragUpdateFake.resetHistory();
  });

  it('should render correct number of rows', () => {
    expect(dndList.rows().length).to.equal(2);
  });

  describe('when moving a row', () => {
    beforeEach(async () => {
      await dndList.moveRowUp();
    });

    it('should call onDragStart', () => {
      expect(onDragStartFake.calledOnce).to.be.true;
    });

    it('should call onDragUpdate', () => {
      expect(onDragUpdateFake.called).to.be.true;
    });

    it('should call onDragEnd', () => {
      expect(onDragEndFake.calledOnce).to.be.true;
    });
  });
});
